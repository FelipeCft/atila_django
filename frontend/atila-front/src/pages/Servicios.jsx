import React from 'react';
import ServiciosList from '../components/ServiciosList';
import PolygonalBackground from '../components/common/PolygonalBackground';

const Servicios = () => {
    return (
        <PolygonalBackground>
            {/* Unified Background Pattern removed here as it is inside PolygonalBackground */}

            {/* Hero Section */}
            <section className="relative pt-32 md:pt-48 pb-20 overflow-hidden bg-transparent">
                {/* WaveBackground removed as per user request */}

                <div className="container-custom relative z-10 w-full">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm font-semibold mb-6 animate-fade-in backdrop-blur-sm border border-white/10">
                            Nuestras Especialidades
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                            Servicios <span className="text-sky-400 italic">Médicos</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                            Ofrecemos una amplia gama de servicios médicos especializados diseñados para cubrir todas tus necesidades de salud con la mayor precisión y cuidado.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container-custom relative z-10 -mt-20 pb-24">
                <ServiciosList />
            </div>
        </PolygonalBackground>
    );
};

export default Servicios;
