import { Shield, Percent } from 'lucide-react';
import ClinicIcon from '../components/common/ClinicIcon';
import FonasaIcon from '../components/common/FonasaIcon';

export const BENEFIT_TYPES = {
    'FONASA': { label: 'FONASA', color: 'bg-[#005596] text-white shadow-lg shadow-black/30', icon: FonasaIcon },
    'CONVENIO_ATILA': { label: 'CONVENIOS ATILA', color: 'bg-primary text-white', icon: ClinicIcon },
    'PROMOCION': { label: 'PROMOCIONES', color: 'bg-yellow-400 text-yellow-950 shadow-yellow-400/50', icon: Percent },
};

