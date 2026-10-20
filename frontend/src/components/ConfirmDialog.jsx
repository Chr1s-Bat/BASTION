import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { FormTextarea } from './FormInput';

/** Confirm step before destructive or workflow actions. Optional remarks box. */
export default function ConfirmDialog({
  title = 'Confirm action',
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  askRemarks = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [remarks, setRemarks] = useState('');

  return (
    <Modal
      title={title}
      icon={AlertTriangle}
      onClose={onCancel}
      width={460}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant={variant} loading={loading} onClick={() => onConfirm(remarks.trim() || undefined)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
      {askRemarks && (
        <FormTextarea
          label="Remarks (optional)"
          name="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add a note for the requesting officer…"
          maxLength={500}
        />
      )}
    </Modal>
  );
}
