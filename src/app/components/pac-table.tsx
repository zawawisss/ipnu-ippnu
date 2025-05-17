"use client";

import {
  Button,
  Chip,
  Input,
  Link as HU_Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Spinner,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation'; // Import useRouter

function PACTable() {
  const [kecamatanData, setKecamatanData] = useState<any>({ data: [], total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default value is 5
  const router = useRouter(); // Inisialisasi router

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset ke halaman 1 saat melakukan pencarian
  };

  const getStatus = (kec: any) => {
    if (!kec.tanggal_berakhir) return "";
    const endDate = new Date(kec.tanggal_berakhir);
    const twoWeeksBefore = new Date(
      endDate.getTime() - 14 * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    if (now < twoWeeksBefore) {
      return "Aktif";
    } else if (now < endDate) {
      return "Hampir Berakhir";
    } else {
      return "Tidak Aktif";
    }
  };

  const sortedData = useMemo(() => {
    const filtered = kecamatanData.data.filter((kec: any) => // Access data property
      kec.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const order: { [key: string]: number } = {
      "Hampir Berakhir": 0,
      Aktif: 1,
      "Tidak Aktif": 2,
    };
    return filtered.sort((a: any, b: any) => {
      const statusA = getStatus(a) || "";
      const statusB = getStatus(b) || "";
      const rankA = order[statusA] !== undefined ? order[statusA] : 3;
      const rankB = order[statusB] !== undefined ? order[statusB] : 3;
      return rankA - rankB;
    });
  }, [searchTerm, kecamatanData]); // Depend on kecamatanData

  // No need for a separate useEffect for totalItems, use kecamatanData.total directly

  const paginatedData = useMemo(() => {
    // Pagination is now handled by the API, this memo might not be strictly necessary for display
    // but keeping it for consistency with local filtering if needed later.
    // The API response already provides the paginated data.
    return sortedData; // Use sortedData which is filtered from the paginated API response
  }, [sortedData]); // Depend on sortedData

  useEffect(() => {
    setIsLoading(true);
    // Fetch data with pagination parameters
    fetch(`/api/kecamatanList?page=${currentPage}&limit=${rowsPerPage}`)
      .then((res) => res.json())
      .then((data) => {
        setKecamatanData(data); // Set the entire response object
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [currentPage, rowsPerPage]); // Depend on currentPage and rowsPerPage

  const handleRowClick = (kecId: string) => {
    router.push(`/kecamatan/${kecId}`); // Navigasi ke halaman detail
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset ke halaman pertama saat item per halaman diubah
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          type="text"
          placeholder="Cari Kecamatan..."
          value={searchTerm}
          onChange={handleSearchChange}
          startContent={<StarIcon className="w-5 h-5 text-gray-400" />}
          className="w-full sm:w-64"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {kecamatanData.total} data ditemukan {/* Use total from API response */}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rowsPerPage" className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Per Halaman:
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                        shadow-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Table aria-label="Data PAC" className="min-w-full" isStriped>
          <TableHeader>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              #
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Kecamatan
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Status SP
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Masa Khidmat
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Nomor SP
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Anggota
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Ranting
            </TableColumn>
            <TableColumn className="text-center bg-gray-50 dark:bg-gray-800">
              Komisariat
            </TableColumn>
            {/* Hapus TableColumn Aksi */}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Spinner size="lg" />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? ( // Use paginatedData for display
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm ? "Data tidak ditemukan" : "Tidak ada data"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((kec: any, i: number) => ( // Use paginatedData for mapping
                <TableRow
                  key={kec._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleRowClick(kec._id)}
                >
                  <TableCell className="text-center">
                    {(kecamatanData.page - 1) * kecamatanData.limit + i + 1} {/* Use page and limit from API response */}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {kec.kecamatan}
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      if (!kec.tanggal_berakhir) return "-";
                      const endDate = new Date(kec.tanggal_berakhir);
                      const twoWeeksBefore = new Date(
                        endDate.getTime() - 14 * 24 * 60 * 60 * 1000
                      );
                      const now = new Date();
                      if (now < twoWeeksBefore) {
                        return (
                          <Chip color="success" variant="dot" size="sm">
                            Aktif
                          </Chip>
                        );
                      } else if (now < endDate) {
                        return (
                          <Chip color="warning" variant="dot" size="sm">
                            Hampir Berakhir
                          </Chip>
                        );
                      } else {
                        return (
                          <Chip color="danger" variant="dot" size="sm">
                            Tidak Aktif
                          </Chip>
                        );
                      }
                    })() || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {kec.tanggal_berakhir
                      ? new Date(kec.tanggal_berakhir).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {kec.nomor_sp || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {kec.jumlah_anggota || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {kec.jumlah_ranting || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {kec.jumlah_komisariat || "-"}
                  </TableCell>
                  {/* Hapus TableCell Aksi */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && kecamatanData.total > 0 && (
        <div className="flex justify-center">
          <Pagination
            total={Math.ceil(kecamatanData.total / rowsPerPage)}
            initialPage={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
          />
        </div>
      )}
    </div>
  );
}

export default PACTable;
