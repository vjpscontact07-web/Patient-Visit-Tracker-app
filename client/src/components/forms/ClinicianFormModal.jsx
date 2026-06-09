import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "../Modal";
import FormActions from "../FormActions";
import { FormServerError, TextField } from "../FormField";
import { clinicianSchema } from "../../schemas/validation";

export default function ClinicianFormModal({
  title,
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
    resolver: yupResolver(clinicianSchema),
    defaultValues: {
      name: initial?.name || "",
      specialty: initial?.specialty || "",
    },
  });

  async function onSubmit(data) {
    setServerError("");
    try {
      await onSave(data);
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
          label="Specialty"
          name="specialty"
          register={register}
          error={errors.specialty}
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
