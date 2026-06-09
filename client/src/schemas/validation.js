import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),
    password: yup.string().required("Password is required"),
});

export const registerSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Full name is required")
        .max(255, "Name is too long"),
    email: yup
        .string()
        .trim()
        .email("Enter a valid email")
        .required("Email is required"),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
});

export const clinicianSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Full name is required")
        .max(255, "Name is too long"),
    specialty: yup
        .string()
        .trim()
        .max(255, "Specialty is too long")
        .default(""),
});

export const patientSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required("Full name is required")
        .max(255, "Name is too long"),
    mrn: yup.string().trim().max(50, "MRN is too long").default(""),
    date_of_birth: yup.string().nullable().default(""),
});

export const visitSchema = yup.object({
    clinician_id: yup.string().required("Select a clinician"),
    patient_id: yup.string().required("Select a patient"),
    visit_date: yup.string().required("Visit date and time is required"),
    notes: yup.string().trim().max(2000, "Notes are too long").default(""),
});

export const rescheduleSchema = yup.object({
    visit_date: yup.string().required("New date and time is required"),
});
