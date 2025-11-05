import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import Swal from "sweetalert2";

export function useConfirmExit(when: boolean) {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    // Mostrar el SweetAlert y decidir
    (async () => {
      const { isConfirmed } = await Swal.fire({
        title: "Hay cambios sin guardar",
        text: "Si sales, perderás los cambios.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Salir de todos modos",
        cancelButtonText: "Quedarme",
      });

      if (isConfirmed) {
        blocker.proceed(); // ✅ continuar la navegación
      } else {
        blocker.reset();   // ❌ cancelar la navegación
      }
    })();
  }, [blocker]);
}
