import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ChevronDown } from 'lucide-react';

const MainLayout = ({ children }) => {
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);

    return (
        <div className="min-h-screen flex flex-col bg-background relative">
            <Navbar isVisible={isNavbarVisible} setIsVisible={setIsNavbarVisible} />

            {/* Toggle button to show navbar when hidden */}
            {!isNavbarVisible && (
                <button
                    onClick={() => setIsNavbarVisible(true)}
                    className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white text-slate-500 hover:text-primary transition-all group"
                    title="Mostrar Menú"
                >
                    <ChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
            )}

            <main className="grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
