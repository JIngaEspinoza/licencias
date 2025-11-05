import Swal from "sweetalert2";

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end", // esquina superior derecha
  showConfirmButton: false,
  timer: 2000, // ms
  timerProgressBar: true,
});
