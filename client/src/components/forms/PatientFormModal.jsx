import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../Modal";
import FormActions from "../FormActions";
import { FormServerError, TextField } from "../FormField";
import { patientSchema } from "../../schemas/validation";

export default function PatientFormModal({ title, initial, onClose, onSave }) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(patientSchema),
    defaultValues: {
      name: initial?.name || "",
      mrn: initial?.mrn || "",
      date_of_birth: initial?.date_of_birth?.slice(0, 10) || "",
    },
  });

  async function onSubmit(data) {
    setServerError("");
    try {
      await onSave({
        name: data.name,
        mrn: data.mrn,
        date_of_birth: data.date_of_birth || null,
      });
    } catch (err) {
      setServerError(err?.message || 'An unexpected error occurred.');
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Full Name"
          name="name"
          register={register}
          error={errors.name}
          required
        />
        <TextField
          label="MRN"
          name="mrn"
          register={register}
          error={errors.mrn}
        />
        <TextField
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          register={register}
          error={errors.date_of_birth}
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
