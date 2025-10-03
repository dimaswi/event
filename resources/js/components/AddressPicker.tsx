import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Province {
    id: string;
    name: string;
}

interface City {
    id: string;
    province_id: string;
    name: string;
}

interface District {
    id: string;
    city_id: string;
    name: string;
}

interface Village {
    id: string;
    district_id: string;
    name: string;
}

interface AddressPickerProps {
    onAddressChange: (address: {
        province: string;
        city: string;
        district: string;
        village?: string;
        postal_code: string;
    }) => void;
    initialValues?: {
        province?: string;
        city?: string;
        district?: string;
        village?: string;
        postal_code?: string;
    };
    errors?: {
        province?: string;
        city?: string;
        district?: string;
        village?: string;
        postal_code?: string;
    };
}

export default function AddressPicker({ onAddressChange, initialValues, errors }: AddressPickerProps) {
    const [provinces] = useState<Province[]>([
        { id: '11', name: 'Aceh' },
        { id: '12', name: 'Sumatera Utara' },
        { id: '13', name: 'Sumatera Barat' },
        { id: '14', name: 'Riau' },
        { id: '15', name: 'Jambi' },
        { id: '16', name: 'Sumatera Selatan' },
        { id: '17', name: 'Bengkulu' },
        { id: '18', name: 'Lampung' },
        { id: '19', name: 'Kepulauan Bangka Belitung' },
        { id: '21', name: 'Kepulauan Riau' },
        { id: '31', name: 'DKI Jakarta' },
        { id: '32', name: 'Jawa Barat' },
        { id: '33', name: 'Jawa Tengah' },
        { id: '34', name: 'DI Yogyakarta' },
        { id: '35', name: 'Jawa Timur' },
        { id: '36', name: 'Banten' },
        { id: '51', name: 'Bali' },
        { id: '52', name: 'Nusa Tenggara Barat' },
        { id: '53', name: 'Nusa Tenggara Timur' },
        { id: '61', name: 'Kalimantan Barat' },
        { id: '62', name: 'Kalimantan Tengah' },
        { id: '63', name: 'Kalimantan Selatan' },
        { id: '64', name: 'Kalimantan Timur' },
        { id: '65', name: 'Kalimantan Utara' },
        { id: '71', name: 'Sulawesi Utara' },
        { id: '72', name: 'Sulawesi Tengah' },
        { id: '73', name: 'Sulawesi Selatan' },
        { id: '74', name: 'Sulawesi Tenggara' },
        { id: '75', name: 'Gorontalo' },
        { id: '76', name: 'Sulawesi Barat' },
        { id: '81', name: 'Maluku' },
        { id: '82', name: 'Maluku Utara' },
        { id: '91', name: 'Papua Barat' },
        { id: '94', name: 'Papua' },
    ]);

    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);

    const [selectedProvince, setSelectedProvince] = useState(initialValues?.province || '');
    const [selectedCity, setSelectedCity] = useState(initialValues?.city || '');
    const [selectedDistrict, setSelectedDistrict] = useState(initialValues?.district || '');
    const [selectedVillage, setSelectedVillage] = useState(initialValues?.village || '');
    const [postalCode, setPostalCode] = useState(initialValues?.postal_code || '');

    // Sample cities for major provinces (simplified for demo)
    const getCitiesByProvince = (provinceId: string): City[] => {
        const cityData: Record<string, City[]> = {
            '31': [ // DKI Jakarta
                { id: '3171', province_id: '31', name: 'Jakarta Selatan' },
                { id: '3172', province_id: '31', name: 'Jakarta Timur' },
                { id: '3173', province_id: '31', name: 'Jakarta Pusat' },
                { id: '3174', province_id: '31', name: 'Jakarta Barat' },
                { id: '3175', province_id: '31', name: 'Jakarta Utara' },
                { id: '3176', province_id: '31', name: 'Kepulauan Seribu' },
            ],
            '32': [ // Jawa Barat
                { id: '3201', province_id: '32', name: 'Kabupaten Bogor' },
                { id: '3202', province_id: '32', name: 'Kabupaten Sukabumi' },
                { id: '3203', province_id: '32', name: 'Kabupaten Cianjur' },
                { id: '3204', province_id: '32', name: 'Kabupaten Bandung' },
                { id: '3271', province_id: '32', name: 'Kota Bogor' },
                { id: '3272', province_id: '32', name: 'Kota Sukabumi' },
                { id: '3273', province_id: '32', name: 'Kota Bandung' },
                { id: '3274', province_id: '32', name: 'Kota Cirebon' },
                { id: '3275', province_id: '32', name: 'Kota Bekasi' },
                { id: '3276', province_id: '32', name: 'Kota Depok' },
            ],
            '33': [ // Jawa Tengah
                { id: '3301', province_id: '33', name: 'Kabupaten Cilacap' },
                { id: '3302', province_id: '33', name: 'Kabupaten Banyumas' },
                { id: '3303', province_id: '33', name: 'Kabupaten Purbalingga' },
                { id: '3371', province_id: '33', name: 'Kota Magelang' },
                { id: '3372', province_id: '33', name: 'Kota Surakarta' },
                { id: '3373', province_id: '33', name: 'Kota Salatiga' },
                { id: '3374', province_id: '33', name: 'Kota Semarang' },
            ],
            '35': [ // Jawa Timur
                { id: '3501', province_id: '35', name: 'Kabupaten Pacitan' },
                { id: '3502', province_id: '35', name: 'Kabupaten Ponorogo' },
                { id: '3571', province_id: '35', name: 'Kota Kediri' },
                { id: '3572', province_id: '35', name: 'Kota Blitar' },
                { id: '3573', province_id: '35', name: 'Kota Malang' },
                { id: '3578', province_id: '35', name: 'Kota Surabaya' },
            ],
            '51': [ // Bali
                { id: '5101', province_id: '51', name: 'Kabupaten Jembrana' },
                { id: '5102', province_id: '51', name: 'Kabupaten Tabanan' },
                { id: '5103', province_id: '51', name: 'Kabupaten Badung' },
                { id: '5171', province_id: '51', name: 'Kota Denpasar' },
            ],
        };

        return cityData[provinceId] || [];
    };

    // Sample districts (simplified for demo)
    const getDistrictsByCity = (cityId: string): District[] => {
        const districtData: Record<string, District[]> = {
            '3171': [ // Jakarta Selatan
                { id: '317101', city_id: '3171', name: 'Kebayoran Baru' },
                { id: '317102', city_id: '3171', name: 'Kebayoran Lama' },
                { id: '317103', city_id: '3171', name: 'Pesanggrahan' },
                { id: '317104', city_id: '3171', name: 'Cilandak' },
                { id: '317105', city_id: '3171', name: 'Pasar Minggu' },
                { id: '317106', city_id: '3171', name: 'Jagakarsa' },
                { id: '317107', city_id: '3171', name: 'Mampang Prapatan' },
                { id: '317108', city_id: '3171', name: 'Pancoran' },
                { id: '317109', city_id: '3171', name: 'Tebet' },
                { id: '317110', city_id: '3171', name: 'Setiabudi' },
            ],
            '3273': [ // Kota Bandung
                { id: '327301', city_id: '3273', name: 'Bandung Kulon' },
                { id: '327302', city_id: '3273', name: 'Babakan Ciparay' },
                { id: '327303', city_id: '3273', name: 'Bojongloa Kaler' },
                { id: '327304', city_id: '3273', name: 'Bojongloa Kidul' },
                { id: '327305', city_id: '3273', name: 'Astana Anyar' },
            ],
            '3578': [ // Kota Surabaya
                { id: '357801', city_id: '3578', name: 'Genteng' },
                { id: '357802', city_id: '3578', name: 'Tegalsari' },
                { id: '357803', city_id: '3578', name: 'Bubutan' },
                { id: '357804', city_id: '3578', name: 'Simokerto' },
                { id: '357805', city_id: '3578', name: 'Pabean Cantian' },
            ],
        };

        return districtData[cityId] || [];
    };

    useEffect(() => {
        if (selectedProvince) {
            const newCities = getCitiesByProvince(selectedProvince);
            setCities(newCities);
            setSelectedCity('');
            setSelectedDistrict('');
            setSelectedVillage('');
            setDistricts([]);
            setVillages([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedCity) {
            const newDistricts = getDistrictsByCity(selectedCity);
            setDistricts(newDistricts);
            setSelectedDistrict('');
            setSelectedVillage('');
            setVillages([]);
        }
    }, [selectedCity]);

    useEffect(() => {
        const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
        const cityName = cities.find(c => c.id === selectedCity)?.name || '';
        const districtName = districts.find(d => d.id === selectedDistrict)?.name || '';

        onAddressChange({
            province: provinceName,
            city: cityName,
            district: districtName,
            village: selectedVillage,
            postal_code: postalCode,
        });
    }, [selectedProvince, selectedCity, selectedDistrict, selectedVillage, postalCode, provinces, cities, districts]);

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="province">Provinsi *</Label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                        <SelectTrigger className={errors?.province ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Pilih Provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                            {provinces.map((province) => (
                                <SelectItem key={province.id} value={province.id}>
                                    {province.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.province && (
                        <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="city">Kota/Kabupaten *</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                        <SelectTrigger className={errors?.city ? 'border-red-500' : ''}>
                            <SelectValue placeholder={selectedProvince ? "Pilih Kota/Kabupaten" : "Pilih Provinsi dulu"} />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="district">Kecamatan *</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedCity}>
                        <SelectTrigger className={errors?.district ? 'border-red-500' : ''}>
                            <SelectValue placeholder={selectedCity ? "Pilih Kecamatan" : "Pilih Kota dulu"} />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map((district) => (
                                <SelectItem key={district.id} value={district.id}>
                                    {district.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors?.district && (
                        <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="postal_code">Kode Pos *</Label>
                    <Input
                        id="postal_code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="12345"
                        maxLength={5}
                        className={errors?.postal_code ? 'border-red-500' : ''}
                    />
                    {errors?.postal_code && (
                        <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
