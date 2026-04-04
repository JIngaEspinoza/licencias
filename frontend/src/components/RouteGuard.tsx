// 👇 NUEVO: guardia de navegación con SweetAlert2
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RouteGuard({ dirty }: { dirty: boolean }) {
  const navigate = useNavigate();

  // Bloquea recarga/cierre de pestaña si hay cambios
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = ""; // requerido por los navegadores
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  // Intercepta navegación interna por <a href="...">
  useEffect(() => {
    const onDocClick = async (e: MouseEvent) => {
      if (!dirty) return;

      const el = (e.target as HTMLElement)?.closest("a[href]") as
        | HTMLAnchorElement
        | null;
      if (!el) return;

      // Ignora externos/descargas/anclas
      const href = el.getAttribute("href") || "";
      const target = el.getAttribute("target");
      const isExternal = /^https?:\/\//i.test(href);
      const isAnchor = href.startsWith("#");
      if (isExternal || isAnchor || target === "_blank") return;

      // Evita navegación por defecto, pregunta
      e.preventDefault();
      const { isConfirmed } = await Swal.fire({
        title: "Hay cambios sin guardar",
        text: "Si sales, perderás los cambios.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Salir de todos modos",
        cancelButtonText: "Quedarme",
      });
      if (isConfirmed) navigate(href);
    };

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [dirty, navigate]);

  return null;
}