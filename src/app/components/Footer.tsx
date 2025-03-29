'use client'
import { Divider, Link } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

function AppFooter(){
    return(
        <footer className="border-t py-6 sm:py-8 mt-8 sm:mt-16 bg-background-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h4 className="font-bold text-lg mb-3 sm:mb-4">PC IPNU & IPPNU Ponorogo</h4>
              <p className="text-default-500">
                Organisasi keterpelajaran yang bergerak dalam bidang pendidikan, sosial, dan keagamaan.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 sm:mb-4">Kontak</h4>
              <div className="space-y-2 text-default-500">
                <p>Email: redaksi.mcp@gmail.com</p>
                <p>Telp: 085257538890/085748626076 </p>
                <p>Alamat: Jl. KH. Ahmad Dahlan No. 60 Ponorogo – Jawa Timur</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 sm:mb-4">Media Sosial</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-default-500 hover:text-primary">
                  <Icon icon="lucide:youtube" className="w-6 h-6" />
                </Link>
                <Link href="#" className="text-default-500 hover:text-primary">
                  <Icon icon="lucide:instagram" className="w-6 h-6" />
                </Link>
                <Link href="#" className="text-default-500 hover:text-primary">
                  <Icon icon="lucide:deepseek" className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
          <Divider className="my-4 sm:my-6" />
          <div className="text-center text-default-500">
            <p>© 2025 PC IPNU & IPPNU Ponorogo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
}

export default AppFooter;