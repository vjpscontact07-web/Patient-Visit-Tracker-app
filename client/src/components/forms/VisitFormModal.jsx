import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../Modal";
import FormActions from "../FormActions";
import {
  FormServerError,
  SelectField,
  TextField,
  TextareaField,
} from "../FormField";
import { visitSchema } from "../../schemas/validation";
import { nowDatetimeLocal, toDatetimeLocal } from "../../utils/dates";

export default function VisitFormModal({
  title,
  clinicians,
  patients,
  initial,
  onClose,
  onSave,
}) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(visitSchema),
    defaultValues: {
      clinician_id: String(initial?.clinician_id || ""),
      patient_id: String(initial?.patient_id || ""),
      visit_date: initial?.visit_date
        ? toDatetimeLocal(initial.visit_date)
        : nowDatetimeLocal(),
      notes: initial?.notes || "",
    },
  });

  const clinicianOptions = clinicians.map((c) => ({
    value: String(c.id),
    label: c.name,
    hint: c.specialty || "General Practice",
  }));

  const patientOptions = patients.map((p) => ({
    value: String(p.id),
    label: p.name,
    hint: p.mrn || "No MRN",
  }));

  async function onSubmit(data) {
    setServerError("");
    try {
      await onSave({
        clinician_id: Number(data.clinician_id),
        patient_id: Number(data.patient_id),
        visit_date: new Date(data.visit_date).toISOString(),
        notes: data.notes,
      });
    } catch (err) {
      setServerError(err?.message || 'An unexpected error occurred.');
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <SelectField
          label="Clinician"
          name="clinician_id"
          register={register}
          error={errors.clinician_id}
          required
          placeholder="Choose a clinician"
          options={clinicianOptions}
        />
        <SelectField
          label="Patient"
          name="patient_id"
          register={register}
          error={errors.patient_id}
          required
          placeholder="Choose a patient"
          options={patientOptions}
        />
        <TextField
          label="Visit Date & Time"
          name="visit_date"
          type="datetime-local"
          register={register}
          error={errors.visit_date}
          required
        />
        <TextareaField
          label="Notes"
          name="notes"
          register={register}
          error={errors.notes}
        />
        <FormServerError message={serverError} />
        <FormActions
          onCancel={onClose}
          submitLabel="Save"
          submitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
