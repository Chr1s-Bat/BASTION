import { useState } from 'react';
import { Boxes, Hash, Layers, Save, Warehouse, Tag } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { FormInput, FormSelect, FormTextarea } from './FormInput';
import { itemService } from '../services/bastion';
import { parseError } from '../services/api';
import { useToast } from '../context/ToastContext';
import { intRange, minLen, required, validate } from '../utils/validators';

/** Create or edit an equipment item. `item` = existing record for editing. */
export default function ItemFormModal({ item, meta, onClose, onSaved }) {
  const toast = useToast();
  const editing = Boolean(item);
  const [form, setForm] = useState({
    name: item?.name ?? '',
    serial_number: item?.serial_number ?? '',
    category_id: item?.category_id ?? '',
    depot_id: item?.depot_id ?? '',
    quantity: item?.quantity ?? 1,
    reorder_level: item?.reorder_level ?? 5,
    description: item?.description ?? '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    const clientErrors = validate({
      name: () => required(form.name, 'Item name') || minLen(form.name, 3, 'Item name'),
      serial_number: () => required(form.serial_number, 'Serial number'),
      category_id: () => required(form.category_id, 'Category'),
      depot_id: () => required(form.depot_id, 'Depot'),
      quantity: () => intRange(form.quantity, 0, 100000, 'Quantity'),
      reorder_level: () => intRange(form.reorder_level, 0, 100000, 'Reorder level'),
    });
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setBusy(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        depot_id: Number(form.depot_id),
        quantity: Number(form.quantity),
        reorder_level: Number(form.reorder_level),
      };
      const saved = editing ? await itemService.update(item.id, payload) : await itemService.create(payload);
      toast.success(editing ? 'Equipment record updated.' : 'Equipment registered in the depot.');
      onSaved(saved);
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields); // Laravel 422 messages shown under the matching fields
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${item.name}` : 'Register new equipment'}
      icon={Boxes}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="amber" icon={Save} loading={busy} type="submit" form="item-form">
            {editing ? 'Save changes' : 'Register item'}
          </Button>
        </>
      }
    >
      <form id="item-form" onSubmit={submit} noValidate className="form-grid">
        <div className="span-2">
          <FormInput label="Item name" name="name" icon={Tag} value={form.name} onChange={onChange}
            error={errors.name} placeholder="VHF Tactical Radio, Handheld" required />
        </div>
        <FormInput label="Serial number" name="serial_number" icon={Hash} value={form.serial_number}
          onChange={onChange} error={errors.serial_number} placeholder="COM-RT-2299" required />
        <FormSelect label="Category" name="category_id" icon={Layers} value={form.category_id}
          onChange={onChange} error={errors.category_id} required>
          <option value="">Select category…</option>
          {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FormSelect>
        <FormSelect label="Depot" name="depot_id" icon={Warehouse} value={form.depot_id}
          onChange={onChange} error={errors.depot_id} required>
          <option value="">Select depot…</option>
          {meta.depots.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </FormSelect>
        <FormInput label="Quantity on hand" name="quantity" type="number" min="0" value={form.quantity}
          onChange={onChange} error={errors.quantity} required />
        <FormInput label="Reorder level" name="reorder_level" type="number" min="0" value={form.reorder_level}
          onChange={onChange} error={errors.reorder_level} hint="Low-stock alert threshold." />
        <div className="span-2">
          <FormTextarea label="Description" name="description" value={form.description} onChange={onChange}
            error={errors.description} maxLength={1000} placeholder="Condition, accessories, handling notes…" />
        </div>
      </form>
    </Modal>
  );
}
