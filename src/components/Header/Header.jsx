import LogoHeader from "../../assets/Header/logo2.png";

export default function Header() {
  return (
    <div className="text-white h-16 p-2 flex justify-between items-center pr-10 pl-10 border-b border-gray-700">
      <div className="flex items-center space-x-10">
        <img src={LogoHeader} alt="Logo Header" className="h-8 w-20" />
        <p className="text-sm font-semibold cursor-pointer font-poppins hover:text-purple-700 transition duration-300">
          Dashboard
        </p>
        <p className="text-sm font-semibold cursor-pointer font-poppins hover:text-purple-700 transition duration-300">
          Transações
        </p>
      </div>
      <div className="border border-white rounded-full px-3 py-1">
        <p className="text-sm font-semibold">Phablo Carvalho</p>
      </div>
    </div>
  );
}
