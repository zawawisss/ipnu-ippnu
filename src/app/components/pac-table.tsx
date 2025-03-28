"use client";

import {
  Button,
  Chip,
  Input,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

function PACTable() {
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const filteredData = useMemo(() => {
    return kecamatanList.filter((kec) =>
      kec.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, kecamatanList]);
  

  useEffect(() => {
    fetch("/api/kecamatanList")
      .then((res) => res.json())
      .then((data) => setKecamatanList(data));
  }, []);

  return (
    <>
    <div>
    <Input
      type="text"
      placeholder="Cari Kecamatan..."
      value={searchTerm}
      onChange={handleSearchChange}
      className="mb-4"
    />
      <Table aria-label="Data PAC" className="lg:col-span-full overflow-y-auto max-h-[200px] scrollbar-none scroll-smooth">
        <TableHeader className="overflow-scroll">
          <TableColumn className="text-center overflow-scroll">#</TableColumn>
          <TableColumn className="text-center overflow-scroll">Kecamatan</TableColumn>
          <TableColumn className="text-center overflow-scroll">Status SP</TableColumn>
          <TableColumn className="text-center overflow-scroll">Masa Khidmat</TableColumn>
          <TableColumn className="text-center overflow-scroll">Nomor SP</TableColumn>
          <TableColumn className="text-center overflow-scroll">Anggota</TableColumn>
          <TableColumn className="text-center overflow-scroll">Ranting</TableColumn>
          <TableColumn className="text-center overflow-scroll">Komisariat</TableColumn>
          <TableColumn className="text-center overflow-scroll">Aksi</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredData.map((kec, i) => (
            <TableRow key={kec._id}>
              <TableCell className="text-center">{i + 1}</TableCell>
              <TableCell className="text-center">{kec.kecamatan}</TableCell>
              <TableCell className="text-center">
                <Chip
                  color={kec.status_sp === "Aktif" ? "success" : "danger"}
                  variant="flat"
                >
                  {kec.status_sp}
                </Chip>
              </TableCell >
              <TableCell className="text-center">
                {kec.tanggal_berakhir
                  ? new Date(kec.tanggal_berakhir).toLocaleDateString("id-ID")
                  : "-"}
              </TableCell>
              <TableCell className="text-center ">{kec.nomor_sp}</TableCell>
              <TableCell className="text-center">{kec.jumlah_anggota}</TableCell>
              <TableCell className="text-center">{kec.jumlah_ranting}</TableCell>
              <TableCell className="text-center">{kec.jumlah_komisariat}</TableCell>
              <TableCell className="text-center">
                <Button
                  showAnchorIcon
                  as={Link}
                  href={`/kecamatan/${kec._id}`}
                  color="primary"
                  variant="solid"
                >
                  Detail
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </>
  );
}

export default PACTable;
