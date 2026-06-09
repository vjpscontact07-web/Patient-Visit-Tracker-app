import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../Modal";
import FormActions from "../FormActions";
import { FormServerError, TextField } from "../FormField";
import { rescheduleSchema } from "../../schemas/validation";
import { nowDatetimeLocal } from "../../utils/dates";

export default function RescheduleModal({ visit, onClose, onSave }) {
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(rescheduleSchema),
    defaultValues: {
      visit_date: nowDatetimeLocal(),
    },
  });

  async function onSubmit(data) {
    setServerError("");
    try {
      await onSave(new Date(data.visit_date).toISOString());
    } catch (err) {
      setServerError(err?.message || 'An unexpected error occurred.');
    }
  }

  return (
    <Modal title="Reschedule Visit" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-sm text-slate-600">
          Rescheduling visit for <strong>{visit.patient_name}</strong> with{" "}
          <strong>{visit.clinician_name}</strong>
        </p>
        <Controller
          name="visit_date"
          control={control}
          render={({ field }) => (
            <TextField
              label="New Date & Time"
              name="visit_date"
              type="datetime-local"
              step="60"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.visit_date}
              required
            />
          )}
        />
        <FormServerError message={serverError} />
        <FormActions
          onCancel={onClose}
          submitLabel="Reschedule"
          submitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
