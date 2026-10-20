import { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Flag, Hash, Send, Target } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { FormInput, FormSelect, FormTextarea } from './FormInput';
import { itemService, requisitionService } from '../services/bastion';
import { parseError } from '../services/api';
import { useToast } from '../context/ToastContext';
import { intRange, minLen, required, validate } from '../utils/validators';

/** Create or edit a requisition. `requisition` = existing record, `presetItemId` = prefill. */
export default function RequisitionFormModal({ requisition, presetItemId, meta, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(requisition);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_id: requisition?.item_id ?? presetItemId ?? '',
    quantity: requisition?.quantity ?? 1,
    purpose: requisition?.purpose ?? '',
    priority: requisition?.priority ?? 'routine',
    needed_by: requisition?.needed_by ?? '',
    remarks: requisition?.remarks ?? '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Only operational equipment can be requisitioned.
  useEffect(() => {
    itemService.list({ status: 'operational', per_page: 50, sort: 'name', dir: 'asc' })
      .then((res) => setItems(res.data))
      .catch((e) => toast.error(parseError(e).message));
  }, [toast]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const clientErrors = validate({
      item_id: () => required(form.item_id, 'Equipment'),
      quantity: () => intRange(form.quantity, 1, 10000, 'Quantity'),
      purpose: () => required(form.purpose, 'Mission purpose') || minLen(form.purpose, 5, 'Mission purpose'),
      needed_by: () => (form.needed_by && form.needed_by < new Date().toISOString().slice(0, 10) ? 'The needed-by date cannot be in the past.' : ''),
    });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setBusy(true);
    try {
      const payload = {
        ...form,
        item_id: Number(form.item_id),
        quantity: Number(form.quantity),
        needed_by: form.needed_by || null,
        remarks: form.remarks || null,
      };
      const saved = editing
        ? await requisitionService.update(requisition.id, payload)
        : await requisitionService.create(payload);
      toast.success(editing ? 'Requisition updated.' : `Requisition ${saved.reference} submitted.`);
      onSaved(saved);
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const selected = items.find((i) => String(i.id) === String(form.item_id));

  return (
    <Modal
      title={editing ? `Edit ${requisition.reference}` : 'New requisition'}
      icon={ClipboardList}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="amber" icon={Send} loading={busy} type="submit" form="req-form">
            {editing ? 'Save changes' : 'Submit requisition'}
          </Button>
        </>
      }
    >
      <form id="req-form" onSubmit={submit} noValidate className="form-grid">
        <div className="span-2">
          <FormSelect label="Equipment" name="item_id" icon={Target} value={form.item_id} onChange={onChange}
            error={errors.item_id} required
            hint={selected ? `${selected.quantity} in stock at ${selected.depot?.name}` : undefined}>
            <option value="">Select equipment…</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.serial_number})</option>)}
          </FormSelect>
        </div>
        <FormInput label="Quantity" name="quantity" type="number" min="1" icon={Hash} value={form.quantity}
          onChange={onChange} error={errors.quantity} required />
        <FormSelect label="Priority" name="priority" icon={Flag} value={form.priority} onChange={onChange} error={errors.priority}>
          {meta.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </FormSelect>
        <div className="span-2">
          <FormInput label="Mission purpose" name="purpose" value={form.purpose} onChange={onChange}
            error={errors.purpose} placeholder="Quarterly field exercise at Camp Halcyon" maxLength={255} required />
        </div>
        <FormInput label="Needed by" name="needed_by" type="date" icon={CalendarDays} value={form.needed_by}
          onChange={onChange} error={errors.needed_by} min={new Date().toISOString().slice(0, 10)} />
        <span />
        <div className="span-2">
          <FormTextarea label="Remarks" name="remarks" value={form.remarks} onChange={onChange}
            error={errors.remarks} maxLength={1000} placeholder="Delivery point, special handling…" />
        </div>
      </form>
    </Modal>
  );
}
