import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { Ticket } from '@/types';
import { Link } from '@inertiajs/react';

interface Props {
    tickets: Ticket[];
    eventSettings: {
        event: Record<string, string>;
        contact: Record<string, string>;
        footer: Record<string, string>;
        sponsor: Record<string, string>;
        sponsors: Record<string, string>;
    };
}

export default function Landing({ tickets, eventSettings }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Function to get sponsors data
    const getSponsors = () => {
        const sponsors = [];
        let index = 1;
        
        while (eventSettings.sponsors?.[`sponsor_${index}_name`]) {
            sponsors.push({
                name: eventSettings.sponsors[`sponsor_${index}_name`],
                type: eventSettings.sponsors[`sponsor_${index}_type`],
                logo: eventSettings.sponsors[`sponsor_${index}_logo`]
            });
            index++;
        }
        
        // Fallback jika tidak ada data sponsor
        if (sponsors.length === 0) {
            return [
                { name: 'Bank Mandiri', type: 'SPONSOR UTAMA', logo: null },
                { name: 'Adidas Indonesia', type: 'OFFICIAL PARTNER', logo: null },
                { name: 'Kompas TV', type: 'MEDIA PARTNER', logo: null },
                { name: 'Pemda DKI Jakarta', type: 'SUPPORTED BY', logo: null },
                { name: 'RS Siloam', type: 'HEALTH PARTNER', logo: null },
                { name: 'Aqua Danone', type: 'BEVERAGE PARTNER', logo: null }
            ];
        }
        
        // Jika sponsor kurang dari 4, duplikasi untuk membuat loop yang menarik
        if (sponsors.length < 4) {
            const duplicatedSponsors = [...sponsors];
            while (duplicatedSponsors.length < 6) {
                duplicatedSponsors.push(...sponsors);
            }
            return duplicatedSponsors.slice(0, 6);
        }
        
        return sponsors;
    };

    const sponsors = getSponsors();

    // Pastikan gradient ada
    const heroGradient = eventSettings.event?.event_hero_gradient || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #059669 75%, #16a34a 100%)';
    
    return (
        <>
            <Head title={`${eventSettings.event?.event_name || 'Event'} - Daftar Sekarang!`} />
            
            <style>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-100%);
                    }
                }
                .animate-marquee {
                    animation: marquee 15s linear infinite;
                    will-change: transform;
                }
                .bg-gradient-main {
                    background: linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #dcfce7 100%);
                }
                .text-white { color: #ffffff; }
                .text-gray-900 { color: #111827; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-400 { color: #9ca3af; }
                .text-gray-700 { color: #374151; }
                .text-gray-500 { color: #6b7280; }
                .bg-white { background-color: #ffffff; }
                .bg-gray-900 { background-color: #111827; }
                .bg-gray-100 { background-color: #f3f4f6; }
                .bg-gray-800 { background-color: #1f2937; }
                .border-gray-800 { border-color: #1f2937; }
            `}</style>
            
            <div className="min-h-screen bg-gradient-main">
                {/* Header - Hidden on mobile */}
                <header className="bg-white shadow-md hidden md:block">
                    <div className="container px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={eventSettings.event?.event_logo || "/logo.svg"} 
                                    alt="Fun Run Logo" 
                                    className="h-10 w-10 object-contain" 
                                    onError={(e) => {
                                        e.currentTarget.src = "/logo.svg";
                                    }}
                                />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {eventSettings.event?.event_name || 'Fun Run Event'}
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {eventSettings.event?.event_subtitle || 'Jakarta Marathon Series'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/check">Cek Pesanan</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/order">Daftar Sekarang</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section 
                    className="relative text-white py-16 md:py-32 bg-cover bg-center"
                    style={{
                        background: eventSettings.event?.event_hero_gradient || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #059669 75%, #16a34a 100%)'
                    }}
                >
                    {/* <div className="absolute inset-0 bg-black bg-opacity-20"></div> */}
                    <div className="relative container mx-auto px-4 text-center">
                        <h1 className="text-3xl md:text-6xl font-bold mb-6">
                            {eventSettings.event?.event_name || 'Fun Run Event 2025'}
                        </h1>
                        <p className="text-base text-white leading-relaxed max-w-3xl mx-auto">
                          {eventSettings.event?.event_description || 
                           "Fun Walk Klinik Muhammadiyah Kedungadem hadir meriah! Jalan sehat, doorprize menarik, dan suasana penuh silaturahmi. Yuk ramaikan bersama keluarga tercinta, langkah sehat menuju kebahagiaan."}
                        </p>

                        
                        {/* Event Info */}
                        <div className="flex justify-center items-center gap-4 md:gap-8 text-xs md:text-sm mb-8 md:mb-12 flex-wrap">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="text-center">{eventSettings.event?.event_location || 'Monas, Jakarta Pusat'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="text-center">
                                    {eventSettings.event?.event_date 
                                        ? formatDate(eventSettings.event.event_date)
                                        : 'Minggu, 15 September 2025'
                                    }
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                                <span>{eventSettings.event?.event_time || '06:00 - 10:00 WIB'}</span>
                            </div>
                        </div>

                        {/* Main CTA Button */}
                        <div className="flex flex-col items-center gap-4">
                            <Button 
                                size="lg" 
                                variant="secondary" 
                                className="text-lg md:text-xl px-8 md:px-12 py-3 md:py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
                                asChild
                            >
                                <Link href="/order">
                                    Daftar Sekarang
                                </Link>
                            </Button>
                            
                            {/* Mobile only: Cek Pesanan button */}
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="md:hidden text-base px-6 py-3 h-auto font-medium bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all"
                                asChild
                            >
                                <Link href="/check">
                                    Cek Pesanan
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Sponsor Section */}
                <section className="py-12 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                                {eventSettings.sponsor?.sponsor_title || 'Didukung Oleh'}
                            </h2>
                            <p className="text-sm md:text-base text-gray-600">
                                {eventSettings.sponsor?.sponsor_subtitle || 'Partner dan sponsor yang mendukung acara Fun Run Event 2025'}
                            </p>
                        </div>
                        
                        {/* Scrolling Sponsors */}
                        <div className="relative overflow-hidden">
                            <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
                                {/* Double the sponsors for seamless loop */}
                                {[...sponsors, ...sponsors].map((sponsor, index) => (
                                    <div 
                                        key={`sponsor-${index}`} 
                                        className="p-4 rounded-lg inline-block flex-shrink-0 min-w-[160px] bg-transparent"
                                    >
                                        {sponsor.logo ? (
                                            <div className="flex justify-center items-center">
                                                <img 
                                                    src={sponsor.logo} 
                                                    alt={sponsor.name}
                                                    className="h-16 w-auto object-contain transition-all duration-300 opacity-80 hover:opacity-100"
                                                    onError={(e) => {
                                                        // Fallback to text if image fails
                                                        const parent = e.currentTarget.parentElement?.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = `
                                                                <div class="text-center p-4 bg-gray-100 rounded-lg">
                                                                    <div class="text-sm font-bold text-gray-700">${sponsor.name}</div>
                                                                    <div class="text-xs text-gray-500">${sponsor.type}</div>
                                                                </div>
                                                            `;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 bg-gray-100 rounded-lg">
                                                <div className="text-sm font-bold text-gray-700">{sponsor.name}</div>
                                                <div className="text-xs text-gray-500">{sponsor.type}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 bg-gray-900 text-white">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8">
                            {/* Logo & Description */}
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <img 
                                        src={eventSettings.event?.event_logo || "/logo.svg"} 
                                        alt="Fun Run Logo" 
                                        className="h-8 w-8 object-contain" 
                                        onError={(e) => {
                                            e.currentTarget.src = "/logo.svg";
                                        }}
                                    />
                                    <h3 className="text-xl font-bold">
                                        {eventSettings.event?.event_name || 'Fun Run Event'}
                                    </h3>
                                </div>
                                <p className="text-gray-400 mb-4">
                                    {eventSettings.footer?.footer_description || 'Acara lari terbesar di Jakarta yang menghadirkan pengalaman lari yang menyenangkan, sehat, dan berkesan untuk seluruh keluarga.'}
                                </p>
                                <div className="text-gray-400">
                                    <p>📍 {eventSettings.event?.event_location || 'Jakarta, Indonesia'}</p>
                                    <p>📧 {eventSettings.contact?.contact_email || 'info@funrunevent.com'}</p>
                                    <p>📞 {eventSettings.contact?.contact_phone || '0812-3456-7890'}</p>
                                </div>
                            </div>
                            
                            {/* Quick Links */}
                            {/* <div>
                                <h4 className="text-lg font-semibold mb-4">Menu</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#home" className="hover:text-white transition-colors">Beranda</a></li>
                                    <li><a href="#about" className="hover:text-white transition-colors">Tentang Event</a></li>
                                    <li><a href="#category" className="hover:text-white transition-colors">Kategori</a></li>
                                    <li><a href="#register" className="hover:text-white transition-colors">Pendaftaran</a></li>
                                    <li><a href="#contact" className="hover:text-white transition-colors">Kontak</a></li>
                                </ul>
                            </div> */}
                            
                            {/* Important Info */}
                            {/* <div>
                                <h4 className="text-lg font-semibold mb-4">Informasi Penting</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Syarat & Ketentuan</li>
                                    <li>Kebijakan Privasi</li>
                                    <li>FAQ</li>
                                    <li>Panduan Peserta</li>
                                    <li>Protokol Kesehatan</li>
                                </ul>
                            </div> */}
                        </div>
                        
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                            <p className="text-gray-400">
                                © 2025 {eventSettings.event?.event_name || 'Fun Run Event'}. Semua hak cipta dilindungi undang-undang. 
                                Diselenggarakan oleh {eventSettings.contact?.organizer_name || 'PT. Sport Event Indonesia'}.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
