export const metadata = { title: "Aviso de Privacidad — Botchi" };

export default function Privacidad() {
  return (
    <>
      <h1>Aviso de Privacidad</h1>
      <p className="text-slate-500">Última actualización: 18 de mayo de 2026</p>

      <p>
        En <strong>Botchi</strong> ([Razón Social], en adelante &quot;el
        Responsable&quot;) protegemos los datos personales de los padres,
        tutores y, de forma especial, de los menores de edad que usan el
        dispositivo. Este Aviso describe qué datos tratamos, con qué fin y los
        derechos que te corresponden, conforme a la legislación aplicable en
        materia de protección de datos personales en México.
      </p>

      <h2>1. Responsable</h2>
      <p>
        [Razón Social], con domicilio en [domicilio], contacto:{" "}
        <a href="mailto:privacidad@botchi.mx">privacidad@botchi.mx</a>.
      </p>

      <h2>2. Datos que recabamos</h2>
      <ul>
        <li>
          <strong>De la cuenta del padre/tutor:</strong> nombre, correo
          electrónico y contraseña cifrada.
        </li>
        <li>
          <strong>Del dispositivo Botchi:</strong> identidad configurada
          (nombre, personalidad), módulos activos y datos técnicos (firmware,
          última conexión).
        </li>
        <li>
          <strong>De aprendizaje del menor:</strong> métricas pedagógicas como
          palabras aprendidas, tiempo de actividad, mapa de calor cognitivo e
          intereses detectados por la IA. No recopilamos grabaciones de voz
          permanentes ni el contenido íntegro de las conversaciones con fines
          comerciales.
        </li>
      </ul>

      <h2>3. Finalidades</h2>
      <ul>
        <li>Operar el dispositivo y personalizar el aprendizaje.</li>
        <li>
          Mostrar a los padres el progreso de sus hijos en la plataforma web.
        </li>
        <li>Enviar actualizaciones de contenido (OTA) al dispositivo.</li>
        <li>Soporte, seguridad y mejora del servicio.</li>
      </ul>
      <p>
        <strong>No</strong> usamos los datos para publicidad, no los vendemos y
        no incluimos rastreo de terceros ni redes sociales.
      </p>

      <h2>4. Datos de menores</h2>
      <p>
        El tratamiento de datos de menores se realiza siempre bajo el control y
        consentimiento del padre o tutor titular de la cuenta, quien puede
        consultarlos, modificarlos o eliminarlos en cualquier momento desde la
        plataforma o solicitándolo al Responsable.
      </p>

      <h2>5. Derechos ARCO</h2>
      <p>
        Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u
        Oposición, así como revocar tu consentimiento, escribiendo a{" "}
        <a href="mailto:privacidad@botchi.mx">privacidad@botchi.mx</a>.
      </p>

      <h2>6. Conservación y seguridad</h2>
      <p>
        Conservamos los datos mientras la cuenta esté activa. Aplicamos medidas
        de seguridad como cifrado, control de acceso y aislamiento por cuenta.
        Al eliminar la cuenta, los datos asociados se eliminan o anonimizan.
      </p>

      <h2>7. Cambios</h2>
      <p>
        Podemos actualizar este Aviso; publicaremos la versión vigente en esta
        página con su fecha de actualización.
      </p>
    </>
  );
}
