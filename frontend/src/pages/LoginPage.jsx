import React from "react";
import LoginForm from "../components/auth/LoginForm";
import "../../public/css/bootstrap/signin.css";
import PublicHeader from '../components/layout/PublicHeader';
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

const LoginPage = () => {
  return (
    <>
      <PublicHeader />
      <div className="container_layout">
        <Sidebar />
        <div className="text-center mt-5">
          <main>
            <LoginForm />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
