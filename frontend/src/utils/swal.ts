import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export async function swalError(text: string, title = "Ups…") {
  await Swal.fire({ icon: "error", title, text, confirmButtonText: "Entendido" });
}
export async function swalInfo(text: string, title = "Aviso") {
  await Swal.fire({ icon: "info", title, text, confirmButtonText: "Ok" });
}
export async function swalSuccess(text: string, title = "Listo") {
  await Swal.fire({ icon: "success", title, text, timer: 1400, showConfirmButton: false });
}
export async function swalConfirm(opts: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: "question" | "warning" | "info";
}) {
  const {
    title,
    text,
    confirmButtonText = "Sí, continuar",
    cancelButtonText = "Cancelar",
    icon = "question",
  } = opts;
  const r = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });
  return r.isConfirmed;
}