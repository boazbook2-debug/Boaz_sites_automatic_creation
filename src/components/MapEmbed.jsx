export default function MapEmbed({ address, className = "" }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className={`overflow-hidden rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${className}`}>
      <iframe
        title="מיקום המשרד"
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
