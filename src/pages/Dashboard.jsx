import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Header from "../components/Header/Header";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
    }
  }, []);

  return (
    <div className="text-white">
      <Header />
    </div>
  );
}
