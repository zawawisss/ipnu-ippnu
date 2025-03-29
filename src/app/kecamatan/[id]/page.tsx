import KecamatanDetail from "@/app/components/pac-data";

interface Props {
  params: Promise<{ id: string }>;
}

async function Hasil({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <KecamatanDetail id={id} />

    </>
  );
}

export default Hasil;
