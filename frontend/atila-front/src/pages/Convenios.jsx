import React from 'react';
import ConveniosList from '../components/ConveniosList';
import PolygonalBackground from '../components/common/PolygonalBackground';

const Convenios = () => {
    return (
        <PolygonalBackground>
            {/* Hero Section */}
            <section className="relative pt-32 md:pt-48 pb-20 overflow-hidden bg-transparent">
                <div className="container-custom relative z-10 w-full">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm font-semibold mb-6 animate-fade-in backdrop-blur-sm border border-white/10">
                            Nuestros Beneficios
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                            Convenios y <span className="text-sky-400 italic">Alianzas</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                            Descubre los convenios y promociones que tenemos disponibles para ti, pensados para facilitar tu acceso a una salud de calidad.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container-custom relative z-10 -mt-20 pb-24">
                <ConveniosList />
            </div>
        </PolygonalBackground>
    );
};

export default Convenios;
