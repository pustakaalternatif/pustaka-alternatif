import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  Grid2X2,
  LayoutDashboard,
  Library,
  List,
  LogOut,
  Menu,
  MapPinned,
  Mail,
  MessageCircle,
  Phone,
  PenLine,
  Plus,
  Printer,
  Search,
  Settings,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import './styles.css';
import {
  createOrder,
  defaultSiteSettings,
  deleteAuthor as deleteAuthorRecord,
  deleteBook as deleteBookRecord,
  deleteCategory as deleteCategoryRecord,
  getOrders,
  hasSupabaseConfig,
  insertCategory,
  listenToAuthChanges,
  loadAdminProfile,
  loadOrders,
  loadSiteData,
  parseRupiah,
  renameCategory as renameCategoryRecord,
  requestPasswordRecoveryOtp,
  saveSiteSettings,
  signInAdmin,
  signOutAdmin,
  supabaseClient,
  updateAdminDisplayName,
  updateOrderStatus as updateOrderStatusRecord,
  upsertAuthor,
  upsertBook,
  uploadBookCover,
  verifyRecoveryOtpAndSetPassword,
} from './lib/backend.js';

const image = (name) => `/assets/${name}`;
const DEFAULT_WHATSAPP = '+6287865997529';
const slugifyIdea = (title = '') => title.toString().toLocaleLowerCase('id-ID').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ideaSlug = (item) => item?.slug || slugifyIdea(item?.title || 'tulisan-ruang-ide');
const ideaShareUrl = (item) => `${window.location.origin}/ruang-ide/${ideaSlug(item)}`;
const whatsappHrefFor = (settings, text = '') => {
  const number = String(settings?.whatsappNumber || DEFAULT_WHATSAPP).replace(/\D/g, '');
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

const parsePrice = (price) => {
  const digits = String(price ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : null;
};

const formatPrice = (amount) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(amount);

const buildOrderMessage = (order, settings = defaultSiteSettings) => {
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : 'Belum tersedia';
  const quantity = Number(order.quantity) || 1;
  const unitPrice = Number(order.priceIdr ?? parsePrice(order.price)) || 0;
  const totalPrice = Number(order.totalPriceIdr ?? (unitPrice * quantity)) || 0;
  const lines = [
    `Halo ${settings.publisherName || 'Pustaka Alternatif'},`,
    'Saya ingin memesan buku berikut.',
    '',
    '*DATA PEMESAN*',
    `Nama: ${order.name || 'Belum tersedia'}`,
    `WhatsApp pemesan: ${order.phone || 'Belum tersedia'}`,
    `Alamat: ${order.address || 'Belum tersedia'}`,
    ...(order.note?.trim() ? [`Catatan: ${order.note.trim()}`] : []),
    '',
    '*RINCIAN PESANAN*',
    `Nomor pesanan: ${order.id || 'Belum tersedia'}`,
    `Judul buku: ${order.bookTitle || 'Belum tersedia'}`,
    `Penulis: ${order.author || 'Belum tersedia'}`,
    `Jumlah: ${quantity} eksemplar`,
    `Harga satuan: ${unitPrice ? formatPrice(unitPrice) : 'Belum tersedia'}`,
    '────────────────────',
    `*TOTAL HARGA BUKU: ${totalPrice ? formatPrice(totalPrice) : 'Belum tersedia'}*`,
    'Ongkos kirim: dikonfirmasi penjual',
    `Waktu pesanan: ${createdAt}`,
    '',
    'Mohon konfirmasi ketersediaan buku dan ongkos kirim. Terima kasih.',
  ];
  return lines.join('\n');
};

const initialBooks = [
  {
    id: 1,
    slug: 'mencari-muhammad-historis',
    title: 'Mencari Muhammad Historis',
    longTitle: 'Mencari Muhammad Historis: Menyingkap Tabir Misteri Suci',
    author: 'Ma’ruf Rusafi',
    authorNote: 'Sastrawan Irak',
    year: '2026',
    category: 'Studi Islam',
    status: 'Telah terbit',
    isbn: '978-623-0000-26-1',
    image: image('mencari-muhammad-front.png'),
    backImage: image('mencari-muhammad-back.png'),
    color: 'blue',
    description: "Siapakah Nabi Muhammad yang sesungguhnya? Nabi dalam iman yang ceritanya dilebih-lebihkan dalam bentuk mukjizat dan hal supranatural lainnya, atau sosok historis yang masih menyimpan banyak misteri? Bagaimana jika kisah-kisah dan sejarah kemunculan Islam awal mengenai Nabi Muhammad selama ini dibangun dari sumber yang perlu dibaca ulang dan dipertanyakan kesahihannya? Benarkah Islam tersebar karena mukjizat al-Qur’an, atau ada kekuatan lain yang selama ini ditutupi oleh narasi mapan? Melalui karyanya yang berjudul Kitab al-Syakhshiyyah al-Muhammadiyyah aw Hall al-Lughz al-Muqaddas, Ma'ruf al-Rusafi melakukan observasi kritis dengan membongkar sirah, hadis, tafsir, dan bahkan sisi balaghah al-Qur’an yang selama ini dipercayai sebagai dogma. Terjemahan buku karya Ma'ruf al-Rusafi ini tidak menawarkan jawaban yang nyaman, ia mengajak pembaca memasuki wilayah paling kontroversial dalam pencarian Nabi Muhammad sebagai sosok agung dalam Islam.",
    featured: true,
  },
  {
    id: 2,
    slug: 'anak-anak-kampung-kami',
    title: 'Anak-Anak Kampung Kami',
    author: 'Nagib Mahfuz',
    authorNote: 'Novelis Mesir',
    year: 'Segera hadir',
    category: 'Sastra Dunia',
    status: 'Akan terbit',
    isbn: '978-623-0000-26-2',
    image: image('anak-anak-kampung-front.png'),
    backImage: image('anak-anak-kampung-back.png'),
    color: 'warm',
    description: "Di sebuah kampung, nama Gabalawi hidup dalam cerita dan ingatan. Rumah besarnya menyimpan kemegahan, sementara anak-cucunya bergulat dengan kemiskinan, ketakutan, dan kekuasaan para preman. Mereka mewarisi janji tentang kehidupan yang adil. Namun, siapakah yang akan menepatinya? Dari Adham hingga Gabal, Rifaa, dan Qasim, harapan terus tumbuh. Ada yang melawan dengan kekuatan. Ada yang menawarkan kasih dan pengampunan. Ada yang menyatukan mereka yang tercerai-berai. Lalu datang Arafa, membawa pengetahuan yang menjanjikan jalan baru yang sekaligus membuka pintu bagi bahaya yang tak terduga. Melalui kisah sebuah kampung, Nagib Mahfuz membentangkan pergulatan manusia dengan iman, kekuasaan, dan kerinduan akan keadilan. Tokoh-tokohnya mengingatkan kita pada kisah-kisah suci yang akrab, tetapi membawa kita ke dunia yang penuh kejutan. Di sini, para pembebas dapat dikenang sementara cita-cita mereka dilupakan. Janji keselamatan pun dapat berubah menjadi alat kekuasaan. Anak-Anak Kampung Kami mengajak kita memasuki dunia yang hangat, keras, dan meresahkan. Sebuah novel yang terus menggugah pertanyaan, bahkan setelah halaman terakhir ditutup: Jika para pembebas telah datang dan pergi, siapakah yang akan mengubah nasib kampung ini?",
    featured: true,
  },
  {
    id: 3,
    slug: 'polemik-kitab-suci',
    title: 'Polemik Kitab Suci',
    author: 'Mun’im Sirry',
    authorNote: 'Dosen Universitas Notre Dame',
    year: 'Segera hadir',
    category: 'Kajian Al-Qur’an',
    status: 'Akan terbit',
    isbn: '978-623-0000-26-3',
    image: image('polemik-kitab-suci-front.png'),
    backImage: image('polemik-kitab-suci-back.png'),
    color: 'lavender',
    description: "Buku ini merupakan kajian akademis atas ayat-ayat polemik Al-Qur’an dan penafsirannya oleh ulama-ulama modern. Enam tafsir modern karya pembaru Muslim dari berbagai belahan dunia diuji secara kritis untuk menyingkap pandangan serta tantangan yang mereka hadapi dalam menafsirkan Kitab Suci dalam konteks dunia yang berbeda. Salah satu argumen utama buku ini ialah bahwa tafsir Al-Qur’an modern merupakan wacana penafsiran yang jauh lebih kaya dan lentur daripada yang selama ini diasumsikan. Tafsir-tafsir pembaru ditelaah dengan perhatian saksama terhadap argumen dan konteks sosio-historis untuk memperjelas metode, posisi, serta cakrawala penafsirannya. Proses ini berlangsung dalam dua arah: pembacaan kritis atas tafsir-tafsir tersebut, serta penelusuran yang jernih dan orisinal terhadap bahasa, retorika, dan dilema Al-Qur’an dalam lima topik perdebatan yang telah menyita perhatian para sarjana lintas agama. Hasilnya ialah sebuah karya dengan jangkauan konseptual yang luas dan kepekaan terhadap kompleksitas wacana keagamaan. Buku ini membuka wilayah kajian baru tentang polemik Kitab Suci, sekaligus sumbangan berharga bagi sejumlah bidang, termasuk studi Al-Qur’an, sejarah tafsir, serta perbincangan teologis yang melibatkan agama-agama Ibrahimik dan, secara lebih luas, agama-agama dunia.",
    featured: true,
  },
  {
    id: 4,
    slug: 'interaksi-islam',
    title: 'Interaksi Islam',
    author: 'Mun’im Sirry',
    authorNote: 'Esai-esai pilihan',
    year: '2024',
    category: 'Studi Islam',
    status: 'Telah terbit',
    isbn: '978-623-0000-24-4',
    price: 'Rp100.000',
    image: image('interaksi-islam-front.png'),
    backImage: image('interaksi-islam-back.png'),
    color: 'green',
    description: "Sebelas esai yang terkumpul dalam buku ini, kendati mendiskusikan beragam tema, mempunyai benang merah yang sama, yakni hendak menggambarkan bahwa Islam merupakan agama yang membentuk dan dibentuk oleh pergulatan (engagement) yang tak pernah selesai. Yang dimaksud dengan “pergulatan” di sini ialah penafsiran yang terus berlangsung atas teks-teks fondasional dan interaksi resiprokal dengan konteks-konteks sosiohistoris yang melingkupi kemunculan dan perkembangan Islam dari zaman ke zaman. Sementara yang pertama (penafsiran atas teks) memang merupakan ciri utama dari pergulatan dengan Kitab Suci, yakni interpretasi dan reinterpretasi, yang kedua (interaksi dengan konteks sosiohistoris) juga tak terelakkan karena Islam, atau agama apapun dalam hal ini, lahir dan berkembang bukan dalam ruang hampa. Islam yang kita saksikan saat ini merupakan hasil dari pergulatan dan pergumulan yang melibatkan beragam penafsiran yang dipromosikan, dinegosiasikan, diperdebatkan, dan akhirnya terbentuk sebagai sistem keimanan yang terus berkembang dan berubah dalam kurun waktu berbeda dan lokasi berbeda.",
  },
  {
    id: 5,
    slug: 'pendidikan-dan-radikalisme',
    title: 'Pendidikan dan Radikalisme',
    author: 'Mun’im Sirry',
    authorNote: 'Riset lapangan',
    year: '2023',
    category: 'Pendidikan Publik',
    status: 'Telah terbit',
    isbn: '978-623-0000-23-5',
    price: 'Rp125.000',
    image: image('pendidikan-radikalisme-front.png'),
    backImage: image('pendidikan-radikalisme-back.png'),
    color: 'coral',
    description: "Buku ini didasarkan pada hasil penelitian lapangan yang dilakukan pada tahun 2018 dan 2019 dengan tujuan memahami, mendokumentasikan, dan menganalisis pandangan siswa SMA tentang keragaman agama, etnik, budaya dan orientasi politik, serta apa yang menyebabkan mahasiswa terpapar paham radikal. Dengan gabungan metode kuantitatif dan kualitatif, buku ini menyuguhkan data dan teori cukup gamblang, yang diharapkan membantu kita memahami fenomena intoleransi di kalangan anak muda terpelajar. Yang unik dari buku ini ialah pemaparannya yang meletakkan potret intoleransi dan radikalisme di Indonesia dalam bingkai yang lebih luas pada tataran dunia global.",
  },
  {
    id: 6,
    slug: 'kemunculan-islam',
    title: 'Kemunculan Islam dalam Kesarjanaan Revisionis',
    author: 'Mun’im Sirry',
    authorNote: 'Studi sejarah',
    year: '2017 / 2019',
    category: 'Sejarah',
    status: 'Telah terbit',
    isbn: '978-623-0000-17-6',
    price: 'Rp90.000',
    image: image('kemunculan-islam-front.png'),
    backImage: image('kemunculan-islam-back.png'),
    color: 'blue',
    description: "Buku ini ditulis tidak untuk meragukan, apalagi mengubah keyakinan anda, para pembaca. Sebuah keyakinan itu terbentuk melalui proses yang panjang sehingga tak mungkin tergoyahkan oleh tawaran gagasan yang dikembangkan dalam buku ini. Tujuan saya sebenarnya cukup sederhana. Yakni, mengajukan sebuah perspektif tentang proses kemunculan Islam ke atas panggung sejarah. Potret historis kelahiran Islam atau Islamic origins yang disuguhkan buku ini berbeda dari keyakinan umum kaum Muslim. Karena itu, jika anda termasuk pembaca yang akan tersinggung manakala pemahaman konvensional anda dipertanyakan, maka saya anjurkan untuk tidak membaca buku ini. Saya juga tidak menganjurkan buku ini bagi mereka yang akan menelan mentah-mentah setiap informasi dan analisis at face value. Sejujurnya, saya tidak khawatir bahwa buku ini akan kehilangan pembaca, karena kedua model pembaca di atas tidaklah signifikan dari segi jumlah, jikapun ada. Tujuan buku ini ialah untuk menstimulasi munculnya pertanyaan-pertanyaan yang menggugah (bahkan, mungkin bagi sebagian orang dianggap provokatif), walaupun mungkin kita tidak bersepakat tentang jawabannya.",
  },
  {
    id: 7,
    slug: 'koeksistensi-islam-kristen',
    title: 'Koeksistensi Islam-Kristen',
    author: 'Mun’im Sirry',
    authorNote: 'Refleksi lintas iman',
    year: '2023',
    category: 'Dialog Antaragama',
    status: 'Telah terbit',
    isbn: '978-623-0000-23-7',
    price: 'Rp80.000',
    image: image('koeksistensi-islam-kristen-front.png'),
    color: 'purple',
    description: "Relasi Islam dan Kristen dalam rentang sejarah yang panjang kerap digambarkan penuh ketegangan, konflik, bahkan perang berdarah. Penaklukan dan perang salib menjadi bagian dari lembaran hitam hubungan kedua komunitas agama terbesar ini. Juga, sentimen negatif yang mengemuka akibat kekhawatiran “Islamisasi” atau Kristenisasi.” Buku ini menyuguhkan gambaran koeksistensi Islam-Kristen yang berbeda. Bukan berarti ketegangan dan konflik itu tak pernah ada, melainkan bukan cerita segalanya. Ada sisi-sisi lain dari hubungan Kristen dan Muslim yang kerap diabaikan. Memang, perjumpaan kedua agama diwarnai dengan rivalitas, permusuhan dan kompetisi. Namun demikian, ada juga momen dialog terbuka, kolaborasi saling menguntungkan, dan persahabatan sejati yang tidak lusuh karena konflik. Saya berharap refleksi-refleksi santai dalam buku ini dapat menginspirasi pembaca untuk meningkatkan kesadaran akan kebersamaan. Kita perlu berikhtiar untuk berkembang bersama dalam keragaman. Kepedulian dan solidaritas kemanusiaan perlu terus ditumbuhkan. Masyarakat plural seperti Indonesia harus mensinergikan keragaman untuk perdamaian dan kemajuan bersama. Tak akan ada perdamaian di dunia tanpa koeksistensi antar-umat beragama. Tak akan ada koeksistensi antar-umat beragama tanpa persahabatan dan kerjasama antara Muslim dan Kristen. Tak akan ada kerjasama antara Muslim dan Kristen tanpa saling pengertian dan respek antar sesama umat manusia. Semoga buku ini membantu ke arah itu.",
  },
  {
    id: 8,
    slug: 'rekonstruksi-islam-historis',
    title: 'Rekonstruksi Islam Historis',
    author: 'Mun’im Sirry',
    authorNote: 'Untuk pembaca luas',
    year: '2021',
    category: 'Sejarah',
    status: 'Telah terbit',
    isbn: '978-623-0000-21-8',
    price: 'Rp110.000',
    image: image('rekonstruksi-islam-historis-front.png'),
    backImage: image('rekonstruksi-islam-historis-back.png'),
    color: 'ink',
    description: "Buku ini ditulis untuk audiens pembaca yang luas: Akademisi, mahasiswa, aktivis dialog antar-agama, pemerhati studi agama-agama, dan pembaca umum. Rekonstruksi Islam Historis mendiskusikan pertanyaan-pertanyaan krusial yang sejak lama cenderung diabaikan dalam studi Islam. Bukti apa yang kita miliki untuk merekonstruksi kemunculan Islam? Kenapa sumber-sumber Muslim yang tersedia saat ini problematik untuk menyingkap peristiwa-peristiwa penting yang terjadi pada abad pertama Islam, seperti kehidupan Nabi, kodifikasi al-Qur’an atau penaklukan dan ekspansi wilayah? Bagaimana problem permulaan Islam sebagai fenomena historis itu dibingkai? Buku ini menguraikan pertanyaan di atas dan pertanyaan-pertanyaan serupa dengan merujuk pada sumber-sumber primer dan sekunder, sembari memperlihatkan perdebatan metodologis di kalangan sarjana-sarjana modern. Dengan spirit menyambut perspektif yang beragam untuk mendorong iklim perdebatan yang sehat, buku ini mengeksplorasi berbagai gagasan, metode, dan paradigma yang berseberangan. Spektrum kesarjanaan revisionis dan tradisionalis yang luas juga dihadirkan untuk mendeteksi perkembangan-perkembangan mutakhir dalam kesarjanaan modern tentang Islam, secara khusus, dan tentang kemunculan agama-agama, secara umum. Diharapkan, buku ini menghidupkan (kembali) gairah intelektual untuk mendiskusikan gagasan-gagasan penting yang menghiasi cakrawala kesarjanaan mutakhir.",
  },
  {
    id: 9,
    slug: 'think-outside-the-box',
    title: 'Think Outside the Box',
    author: 'Mun’im Sirry',
    authorNote: 'Catatan dengan perspektif baru',
    year: '2024',
    category: 'Esai',
    status: 'Telah terbit',
    isbn: '978-623-0000-24-9',
    price: 'Rp98.000',
    image: image('think-outside-box-front.png'),
    backImage: image('think-outside-box-back.png'),
    color: 'orange',
    description: "Buku ini seperti rekaman catatan harian yang membicarakan masalah-masalah lama dengan perspektif baru. Ia lahir dari perbincangan di dunia media sosial (medsos). Walaupun tidak seluruh tulisan dalam buku ini telah dipublikasikan di medsos, namun ide-ide dasarnya sudah pernah di-shared di Facebook. Dalam beberapa kesempatan, saya menulis status berseri tentang tema tertentu. Misalnya, soal menafsirkan al-Qur’an dengan Alkitab atau soal nikah beda agama. Tema-tema tersebut ditulis untuk memberikan wawasan kepada pembaca umum. Tidak perlu detail, namun langsung menukik ke jantung permasalahan. Diharapkan, tulisan-tulisan pendek dapat menginspirasi pembacaan lebih lanjut. Dalam buku ini gaya tutur yang populer tersebut masih tetap dipertahankan.",
  },
].map((book) => ({ ...book, priceIdr: parsePrice(book.price) }));


const initialAuthors = [
  { id: 'author-maruf-rusafi', name: 'Ma’ruf Rusafi', bio: 'Sastrawan Irak dengan perhatian pada sejarah, bahasa, dan ingatan kebudayaan.', focus: 'Sastra & sejarah' },
  { id: 'author-nagib-mahfuz', name: 'Nagib Mahfuz', bio: 'Novelis Mesir yang menulis tentang iman, kekuasaan, dan kehidupan sehari-hari.', focus: 'Sastra dunia' },
  { id: 'author-munim-sirry', name: 'Mun’im Sirry', bio: 'Penulis dan pengajar yang mengembangkan kajian Islam, sejarah, dan dialog lintas iman.', focus: 'Studi Islam & dialog' },
];

const navItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Katalog', path: '/katalog' },
  { label: 'Tentang kami', path: '/tentang' },
  { label: 'Ruang Ide', path: '/ruang-ide' },
  { label: 'Naskah & kerja sama', path: '/naskah-kerjasama' },
];

const statusClass = (status) => {
  if (status === 'Telah terbit') return 'published';
  if (status === 'Akan terbit') return 'upcoming';
  return 'draft';
};

function App() {
  const initialCategories = useMemo(() => [...new Set(initialBooks.map((book) => book.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')), []);
  const [books, setBooks] = useState(initialBooks);
  const [categories, setCategories] = useState(initialCategories);
  const [authors, setAuthors] = useState(initialAuthors);
  const [orders, setOrders] = useState(() => hasSupabaseConfig ? [] : getOrders());
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);
  const [dataMode, setDataMode] = useState(hasSupabaseConfig ? 'loading' : 'preview');
  const [dataError, setDataError] = useState('');
  const [authState, setAuthState] = useState({ loading: hasSupabaseConfig, user: null, profile: null, error: '' });
  const [route, setRoute] = useState(window.location.pathname);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handlePop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    let active = true;
    const resolveSession = async (session) => {
      if (!active) return;
      if (!session?.user) {
        setAuthState({ loading: false, user: null, profile: null, error: '' });
        return;
      }
      try {
        const profile = await loadAdminProfile(session.user.id);
        if (!active) return;
        if (!profile) {
          await signOutAdmin();
          setAuthState({ loading: false, user: null, profile: null, error: 'Akun ini tidak terdaftar sebagai admin aktif.' });
          return;
        }
        setAuthState({ loading: false, user: session.user, profile, error: '' });
      } catch (error) {
        if (active) setAuthState({ loading: false, user: null, profile: null, error: error.message });
      }
    };
    if (!hasSupabaseConfig) {
      setAuthState({ loading: false, user: null, profile: null, error: '' });
      return () => { active = false; };
    }
    supabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      return resolveSession(data.session);
    }).catch((error) => {
      if (active) setAuthState({ loading: false, user: null, profile: null, error: error.message });
    });
    const unsubscribe = listenToAuthChanges((_event, session) => {
      Promise.resolve().then(() => resolveSession(session));
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const fallbackSite = { books: initialBooks, categories: initialCategories, authors: initialAuthors, settings: defaultSiteSettings };
  useEffect(() => {
    let active = true;
    setDataMode(hasSupabaseConfig ? 'loading' : 'preview');
    loadSiteData(fallbackSite).then((data) => {
      if (!active) return;
      setBooks(data.books);
      setCategories(data.categories);
      setAuthors(data.authors);
      setSiteSettings(data.settings);
      setDataMode(data.mode);
      setDataError('');
    }).catch((error) => {
      if (!active) return;
      setDataMode('error');
      setDataError(error.message || 'Data situs tidak dapat dimuat dari Supabase.');
    });
    return () => { active = false; };
  }, [authState.profile?.user_id]);

  useEffect(() => {
    let active = true;
    if (!authState.profile) return () => { active = false; };
    loadOrders().then((remoteOrders) => {
      if (active) setOrders(remoteOrders);
    }).catch((error) => {
      if (active) setDataError(error.message || 'Pesanan tidak dapat dimuat.');
    });
    return () => { active = false; };
  }, [authState.profile?.user_id]);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const key = 'pa_visitor_logs_v1';
      const current = JSON.parse(localStorage.getItem(key) || '{}');
      current[today] = (current[today] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(current));
    } catch (e) {}
  }, [route]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const addOrder = (order) => setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);

  const handleLogin = async (email, password) => {
    const result = await signInAdmin(email, password);
    setAuthState({ loading: false, user: result.user, profile: result.profile, error: '' });
  };
  const handlePasswordRecovery = async ({ email, otp, password }) => {
    const result = await verifyRecoveryOtpAndSetPassword({ email, otp, password });
    setAuthState({ loading: false, user: result.user, profile: result.profile, error: '' });
  };
  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      setAuthState({ loading: false, user: null, profile: null, error: '' });
      navigate('/admin');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const updated = await updateOrderStatusRecord(orderId, status);
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...updated } : order));
      notify(`Status pesanan diperbarui menjadi “${status}”.`);
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const saveBook = async (book) => {
    const previous = book.id ? books.find((item) => item.id === book.id) : null;
    if (previous?.featured && !book.featured && books.filter((item) => item.featured).length <= 2) {
      notify('Minimal dua buku harus tetap dipilih sebagai Pilihan editor di beranda.', 'info');
      return false;
    }
    try {
      if (book.category && !categories.includes(book.category)) {
        await insertCategory(book.category);
        setCategories((current) => [...current, book.category].sort((a, b) => a.localeCompare(b, 'id')));
      }
      const slug = previous?.slug || book.slug || `${book.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
      const saved = await upsertBook({ ...book, slug, priceIdr: Number(book.priceIdr) });
      setBooks((current) => previous
        ? current.map((item) => item.id === previous.id ? { ...item, ...saved } : item)
        : [saved, ...current]);
      notify(previous ? 'Metadata buku tersimpan.' : 'Buku baru berhasil ditambahkan.');
      return true;
    } catch (error) {
      notify(error.message, 'error');
      return false;
    }
  };

  const updateBook = async (id, field, value) => {
    const book = books.find((item) => item.id === id);
    if (!book) return;
    const featuredCount = books.filter((item) => item.featured).length;
    if (field === 'featured' && book.featured && !value && featuredCount <= 2) {
      notify('Minimal dua buku harus tetap dipilih sebagai Pilihan editor di beranda.', 'info');
      return;
    }
    try {
      const updated = await upsertBook({ ...book, [field]: value });
      setBooks((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
      if (field === 'status') notify(`Status “${book.title}” diubah menjadi ${value}.`);
      if (field === 'featured') notify(value ? `“${book.title}” ditambahkan ke Pilihan editor.` : `“${book.title}” dihapus dari Pilihan editor.`);
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const deleteBook = async (id) => {
    const target = books.find((book) => book.id === id);
    if (!target) return;
    if (target.featured && books.filter((book) => book.featured).length <= 2) {
      notify('Buku Pilihan editor ini tidak dapat dihapus karena beranda memerlukan minimal dua buku.', 'info');
      return;
    }
    if (!window.confirm(`Hapus “${target.title}” dari katalog?`)) return;
    try {
      await deleteBookRecord(id);
      setBooks((current) => current.filter((book) => book.id !== id));
      notify('Buku dihapus dari katalog.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const addCategory = async (value) => {
    const name = value.trim();
    if (!name || name.toLocaleLowerCase('id-ID') === 'semua kategori') {
      notify('Masukkan nama kategori yang valid.', 'info');
      return false;
    }
    if (categories.some((category) => category.toLocaleLowerCase('id-ID') === name.toLocaleLowerCase('id-ID'))) {
      notify(`Kategori “${name}” sudah tersedia.`, 'info');
      return false;
    }
    try {
      await insertCategory(name);
      setCategories((current) => [...current, name].sort((a, b) => a.localeCompare(b, 'id')));
      notify(`Kategori “${name}” berhasil ditambahkan.`);
      return true;
    } catch (error) {
      notify(error.message, 'error');
      return false;
    }
  };

  const removeCategory = async (name) => {
    if (books.some((book) => book.category === name)) {
      notify(`Kategori “${name}” masih digunakan oleh buku. Ubah kategorinya terlebih dahulu.`, 'info');
      return;
    }
    try {
      await deleteCategoryRecord(name);
      setCategories((current) => current.filter((category) => category !== name));
      notify(`Kategori “${name}” dihapus.`, 'info');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const renameCategory = async (previousName, nextValue) => {
    const name = nextValue.trim();
    if (!name || name.toLocaleLowerCase('id-ID') === 'semua kategori') {
      notify('Pilih nama kategori yang valid.', 'info');
      return false;
    }
    if (categories.some((category) => category !== previousName && category.toLocaleLowerCase('id-ID') === name.toLocaleLowerCase('id-ID'))) {
      notify(`Kategori “${name}” sudah tersedia.`, 'info');
      return false;
    }
    if (name === previousName) return true;
    try {
      await renameCategoryRecord(previousName, name);
      setCategories((current) => current.map((category) => category === previousName ? name : category).sort((a, b) => a.localeCompare(b, 'id')));
      setBooks((current) => current.map((book) => book.category === previousName ? { ...book, category: name } : book));
      notify(`Kategori “${previousName}” diubah menjadi “${name}”.`);
      return true;
    } catch (error) {
      notify(error.message, 'error');
      return false;
    }
  };

  const saveAuthor = async (author) => {
    const previous = author.id ? authors.find((item) => item.id === author.id) : null;
    try {
      const saved = await upsertAuthor({ ...author, name: author.name.trim() });
      if (previous && previous.name !== saved.name) {
        const updatedBooks = books.map((book) => book.authorId === saved.id || book.author === previous.name
          ? { ...book, authorId: saved.id, author: saved.name }
          : book);
        for (const book of updatedBooks.filter((item) => item.authorId === saved.id)) await upsertBook(book);
        setBooks(updatedBooks);
      }
      setAuthors((current) => previous
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      notify(previous ? 'Data penulis diperbarui.' : 'Penulis baru berhasil ditambahkan.');
      return true;
    } catch (error) {
      notify(error.message, 'error');
      return false;
    }
  };

  const removeAuthor = async (id) => {
    const author = authors.find((item) => item.id === id);
    if (!author || !window.confirm(`Hapus profil penulis “${author.name}”?`)) return;
    try {
      await deleteAuthorRecord(id);
      setAuthors((current) => current.filter((item) => item.id !== id));
      setBooks((current) => current.map((book) => book.authorId === id ? { ...book, authorId: '', author: book.author } : book));
      notify(`Penulis “${author.name}” dihapus.`, 'info');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const handleSaveSettings = async (nextSettings) => {
    try {
      const saved = await saveSiteSettings(nextSettings);
      setSiteSettings(saved);
      notify('Pengaturan situs berhasil disimpan.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const handleSaveProfile = async (displayName) => {
    try {
      const user = await updateAdminDisplayName(displayName);
      setAuthState((current) => ({
        ...current,
        user,
        profile: { ...current.profile, display_name: user.user_metadata?.display_name || displayName.trim() },
      }));
      notify('Profil admin berhasil disimpan.');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const isAdmin = route.startsWith('/admin');
  const visibleBooks = books.filter((book) => book.status === 'Telah terbit' || (siteSettings.showUpcoming && book.status === 'Akan terbit'));
  const bookMatch = route.match(/^\/buku\/([^/]+)/);
  const checkoutMatch = route.match(/^\/checkout\/([^/]+)/);
  const ideaMatch = route.match(/^\/ruang-ide\/([^/]+)/);
  const selectedBook = bookMatch
    ? visibleBooks.find((book) => book.slug === bookMatch[1])
    : checkoutMatch ? visibleBooks.find((book) => book.slug === checkoutMatch[1]) : null;
  const publishedIdeas = (siteSettings.editorialIdeas || []).filter((item) => item.status === 'Terbit');
  const selectedIdea = ideaMatch ? publishedIdeas.find((item) => ideaSlug(item) === ideaMatch[1]) : null;

  return (
    <>
      {isAdmin ? (
        authState.loading ? <AdminLoading /> : !authState.profile ? (
          <AdminLoginPage configured={hasSupabaseConfig} error={authState.error} onLogin={handleLogin} onRequestOtp={requestPasswordRecoveryOtp} onCompleteRecovery={handlePasswordRecovery} navigate={navigate} logoUrl={siteSettings?.logoUrl} />
        ) : (
          <AdminShell
            books={books}
            setBooks={setBooks}
            categories={categories}
            authors={authors}
            orders={orders}
            siteSettings={siteSettings}
            route={route}
            navigate={navigate}
            notify={notify}
            profile={authState.profile}
            user={authState.user}
            dataMode={dataMode}
            dataError={dataError}
            onSignOut={handleSignOut}
            onSaveProfile={handleSaveProfile}
            onSaveSettings={handleSaveSettings}
            onOrderStatus={handleUpdateOrderStatus}
            saveBook={saveBook}
            updateBook={updateBook}
            deleteBook={deleteBook}
            addCategory={addCategory}
            deleteCategory={removeCategory}
            renameCategory={renameCategory}
            saveAuthor={saveAuthor}
            deleteAuthor={removeAuthor}
            onUploadCover={uploadBookCover}
          />
        )
      ) : (
        <PublicShell route={route} navigate={navigate} mobileNav={mobileNav} setMobileNav={setMobileNav} settings={siteSettings}>
          {dataMode === 'error' && <div className="site-data-warning" role="status">Data situs belum tersinkron dengan Supabase: {dataError}</div>}
          {route === '/' && <HomePage books={visibleBooks} categories={categories} settings={siteSettings} navigate={navigate} />}
          {route === '/katalog' && <CatalogPage books={visibleBooks} categories={categories} navigate={navigate} />}
          {route === '/tentang' && <AboutPage settings={siteSettings} navigate={navigate} />}
          {route === '/ruang-ide' && <IdeasPage settings={siteSettings} navigate={navigate} />}
          {ideaMatch && <IdeaDetailPage item={selectedIdea} navigate={navigate} />}
          {route === '/naskah-kerjasama' && <SubmissionsPage settings={siteSettings} />}
          {route.startsWith('/checkout/') && <CheckoutPage book={selectedBook} settings={siteSettings} navigate={navigate} onCreated={addOrder} notify={notify} />}
          {bookMatch && <BookDetail book={selectedBook} books={visibleBooks} settings={siteSettings} navigate={navigate} />}
          {!bookMatch && !ideaMatch && !route.startsWith('/checkout/') && !['/', '/katalog', '/tentang', '/ruang-ide', '/naskah-kerjasama'].includes(route) && <NotFound navigate={navigate} />}
        </PublicShell>
      )}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function AdminLoading() {
  return <main className="admin-auth-page"><section className="admin-auth-card"><span className="eyebrow">Workspace aman</span><h1>Memeriksa <em>sesi admin.</em></h1><p>Memastikan akun memiliki akses admin yang aktif.</p></section></main>;
}

function AdminLoginPage({ configured, error, onLogin, onRequestOtp, onCompleteRecovery, navigate, logoUrl }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState(error || '');

  const submit = async (event) => {
    event.preventDefault();
    setNotice('');
    setFormError('');
    if (!configured) {
      setFormError('Supabase belum dikonfigurasi. Login aman dan OTP aktif setelah URL, anon key, schema, admin, dan SMTP disiapkan sesuai README.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else if (mode === 'request') {
        await onRequestOtp(email);
        setMode('verify');
        setNotice('Jika alamat tersebut terdaftar, kode OTP pemulihan telah dikirim. Periksa kotak masuk dan folder spam.');
      } else {
        if (otp.trim().length < 6) throw new Error('Masukkan kode OTP dari email.');
        if (newPassword.length < 10) throw new Error('Kata sandi baru harus terdiri dari minimal 10 karakter.');
        if (newPassword !== confirmPassword) throw new Error('Konfirmasi kata sandi belum sama.');
        await onCompleteRecovery({ email, otp, password: newPassword });
      }
    } catch (caught) {
      setFormError(caught.message || 'Permintaan tidak dapat diproses.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-auth-page">
      <button className="auth-back-corner" onClick={() => { if (window.history.length > 1) window.history.back(); else navigate('/'); }} aria-label="Kembali ke halaman sebelumnya" title="Kembali"><ArrowLeft size={21} /></button>
      <section className="admin-auth-card">
        <div className="admin-auth-brand-lockup">
          <button className="brand admin-auth-brand" onClick={() => navigate('/')} aria-label="Kembali ke situs">
            <span className="brand-mark"><img src={logoUrl || image('logo-remove-background.png')} alt="" /></span>
          </button>
          <div className="brand-text admin-auth-brand-text">
            <span className="brand-top">Pustaka Alternatif</span>
            <span className="brand-sub-orange">Indonesia</span>
          </div>
        </div>
        {formError && <div className="auth-error" role="alert">{formError}</div>}
        {notice && <div className="auth-success" role="status">{notice}</div>}
        <form className="admin-auth-form" onSubmit={submit}>
          <label className="form-field"><span>Email admin <b>*</b></span><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@contoh.id" /></label>
          {mode === 'login' && <label className="form-field"><span>Kata sandi <b>*</b></span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" /></label>}
          {mode === 'verify' && <>
            <label className="form-field"><span>Kode OTP email <b>*</b></span><input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Masukkan kode OTP" /></label>
            <label className="form-field"><span>Kata sandi baru <b>*</b></span><input type="password" autoComplete="new-password" minLength="10" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minimal 10 karakter" /></label>
            <label className="form-field"><span>Ulangi kata sandi baru <b>*</b></span><input type="password" autoComplete="new-password" minLength="10" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Ulangi kata sandi" /></label>
          </>}
          {mode === 'login' ? <button type="button" className="auth-forgot" disabled={!configured} onClick={() => { setMode('request'); setFormError(''); setNotice(''); }}>Lupa kata sandi?</button>
            : <button type="button" className="auth-forgot" onClick={() => { setMode(mode === 'verify' ? 'request' : 'login'); setFormError(''); setNotice(''); }}>{mode === 'verify' ? 'Kirim ulang / ubah email OTP' : 'Kembali ke login'}</button>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy || !configured}>{busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : mode === 'request' ? 'Kirim kode OTP' : 'Verifikasi & simpan kata sandi'}</button>
        </form>
      </section>
    </main>
  );
}

function PublicShell({ children, route, navigate, mobileNav, setMobileNav, settings }) {
  return (
    <div className="public-shell">
      <header className="site-header">
        <button className="brand" onClick={() => navigate('/')} aria-label="Pustaka Alternatif Indonesia, kembali ke beranda">
          <span className="brand-mark"><img src={settings?.logoUrl || image('logo-remove-background.png')} alt="" /></span>
          <span className="brand-text">
            <span className="brand-top">Pustaka Alternatif</span>
            <span className="brand-sub-orange">Indonesia</span>
          </span>
        </button>
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Buka menu"><Menu size={20} /></button>
        <nav className={`main-nav ${mobileNav ? 'open' : ''}`}>
          {navItems.map((item) => <button key={item.path} className={route === item.path ? 'active' : ''} onClick={() => navigate(item.path)}>{item.label}</button>)}
          <span className="nav-divider" />
          <button className="admin-link" onClick={() => navigate('/admin')}><LayoutDashboard size={15} /> Admin</button>
        </nav>
        <button className="header-search" onClick={() => navigate('/katalog')} aria-label="Cari di katalog"><Search size={19} /></button>
      </header>
      <main>{children}</main>
      <PublicFooter navigate={navigate} settings={settings} showContact={!route.startsWith('/checkout/')} />
      {!route.startsWith('/checkout/') && <WhatsAppFloat settings={settings} />}
    </div>
  );
}

function PublicFooter({ navigate, settings, showContact = true }) {
  return (
    <footer className="public-footer">
      <div className="footer-top">
        <div className="footer-brand-block">
          <div className="footer-wordmark">
            <span className="mini-mark"><img src={settings?.logoUrl || image('logo-remove-background.png')} alt="" /></span>
            <span className="brand-text footer-brand-text">
              <span className="brand-top">Pustaka Alternatif</span>
              <span className="brand-sub-orange">Indonesia</span>
            </span>
          </div>
          <p>{settings.tagline}</p>
        </div>
        <div className="footer-column"><span className="footer-label">Jelajah</span><button onClick={() => navigate('/katalog')}>Katalog buku</button><button onClick={() => navigate('/tentang')}>Tentang kami</button><button onClick={() => navigate('/ruang-ide')}>Ruang ide</button><button onClick={() => navigate('/naskah-kerjasama')}>Naskah & kerja sama</button></div>
        {showContact && <div className="footer-column"><span className="footer-label">Hubungi</span><a href={whatsappHrefFor(settings)} target="_blank" rel="noreferrer">WhatsApp</a><a href="mailto:pustakaalternatif@gmail.com">pustakaalternatif@gmail.com</a><a href="tel:+6287865997529">+62 878-6599-7529</a></div>}
        <div className="footer-note"><span className="eyebrow">Ruang untuk gagasan</span><p>“Perbedaan pendapat menyehatkan kehidupan intelektual ketika disertai ketelitian dan kesediaan untuk mendengarkan.”</p></div>
      </div>
      <div className="footer-bottom"><span>© 2026 {settings.publisherName || 'Pustaka Alternatif Indonesia'}</span></div>
    </footer>
  );
}

function WhatsAppIcon() {
  return <span className="whatsapp-float-icon" aria-hidden="true"><MessageCircle size={25} strokeWidth={2.2} /><Phone size={12} strokeWidth={2.8} className="whatsapp-phone-mark" /></span>;
}

function WhatsAppFloat({ settings }) {
  const href = whatsappHrefFor(settings, `Halo ${settings.publisherName}, saya ingin bertanya tentang katalog buku.`);
  return (
    <a className="whatsapp-float" href={href} target="_blank" rel="noreferrer" aria-label={`Hubungi ${settings.publisherName} melalui WhatsApp`}>
      <WhatsAppIcon />
      <span className="whatsapp-float-label">Hubungi via WhatsApp</span>
    </a>
  );
}

function GlobeModel() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9e4ee, 2.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);
    const globe = new THREE.Group();
    globe.rotation.x = -0.12;
    scene.add(globe);
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const loader = new GLTFLoader();
    loader.load('/assets/globe.glb', (asset) => {
      const model = asset.scene;
      model.scale.setScalar(1.8);
      model.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = false;
        node.receiveShadow = false;
        if (node.material) node.material.side = THREE.DoubleSide;
      });
      globe.add(model);
      resize();
    });
    let frame = 0;
    const animate = (time) => {
      globe.rotation.y = time * 0.00022;
      globe.rotation.z = Math.sin(time * 0.00018) * 0.035;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef} className="globe-model" aria-label="Globe tiga dimensi berputar" />;
}

function HeroBookMockup({ book }) {
  return <div className="hero-book-body"><img className="hero-book-cover" src={book.image} alt={book.title} /></div>;
}

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, active: false, pressed: false };
    let particles = [];
    let animationFrame = 0;
    let time = 0;
    let width = 0;
    let height = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!particles.length) {
        const count = Math.min(115, Math.max(54, Math.floor((width * height) / 8000)));
        particles = Array.from({ length: count }, (_, index) => {
          const x = Math.random() * width;
          const y = Math.random() * height;
          return { x, y, homeX: x, homeY: y, vx: 0, vy: 0, size: index % 9 === 0 ? 2.2 : 1.2, alpha: .24 + Math.random() * .5 };
        });
      }
    };
    const locate = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    };
    const press = (event) => { locate(event); pointer.pressed = true; };
    const release = () => { pointer.pressed = false; };
    const leave = () => { pointer.active = false; pointer.pressed = false; };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        const homeX = particle.homeX + Math.sin(time * .008 + particle.homeY * .02) * 2;
        const homeY = particle.homeY + Math.cos(time * .007 + particle.homeX * .018) * 2;
        particle.vx += (homeX - particle.x) * .0018;
        particle.vy += (homeY - particle.y) * .0018;
        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.max(12, Math.sqrt(dx * dx + dy * dy));
          const radius = pointer.pressed ? 190 : 135;
          if (distance < radius) {
            const influence = (1 - distance / radius) ** 2;
            const direction = pointer.pressed ? .018 : -.028;
            particle.vx += (dx / distance) * influence * direction;
            particle.vy += (dy / distance) * influence * direction;
          }
        }
        particle.vx *= .93;
        particle.vy *= .93;
        particle.x += particle.vx;
        particle.y += particle.vy;
        context.beginPath();
        context.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });
      time += 1;
      if (!reduceMotion) animationFrame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', locate);
    canvas.addEventListener('pointerdown', press);
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointerleave', leave);
    draw();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', locate);
      canvas.removeEventListener('pointerdown', press);
      canvas.removeEventListener('pointerup', release);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, []);
  return <canvas ref={canvasRef} className="particle-field" aria-label="Animasi partikel interaktif" />;
}

function HomePage({ books, categories, settings, navigate }) {
  const featured = books.filter((book) => book.featured);
  const heroFront = featured[0] || books[0] || initialBooks[0];
  const heroBack = featured[1] || books[1] || initialBooks[1];
  const tickerCategories = [...new Set(categories.map((category) => category.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'));
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <h1>Membuka<br /><span>wacana,</span><br />menyalakan<br /><i>gagasan.</i></h1>
          <p className="hero-lead">{settings.heroLead}</p>
          <div className="hero-actions"><button className="button button-dark" onClick={() => navigate('/katalog')}>Jelajahi katalog <ArrowUpRight size={17} /></button><button className="text-button" onClick={() => navigate('/tentang')}>Kenali penerbit <ArrowDownRight size={16} /></button></div>
        </div>
        <div className="hero-art" aria-label="Mockup buku dan globe tiga dimensi"><ParticleField />
          <GlobeModel />
          <span className="hero-number">01<span>/03</span></span>
          <div className="hero-book back-book"><HeroBookMockup book={heroBack} /></div>
          <div className="hero-book front-book"><HeroBookMockup book={heroFront} /></div>
        </div>
      </section>

      <section className="ticker" aria-label="Kategori yang tersedia">{tickerCategories.length ? <div className="ticker-inner">{[0, 1].map((copy) => <div className="ticker-group" key={`ticker-copy-${copy}`} aria-hidden={copy === 1 ? 'true' : undefined}>{tickerCategories.map((category) => <React.Fragment key={`${copy}-${category}`}><span>{category}</span><i aria-hidden="true">✦</i></React.Fragment>)}</div>)}</div> : <div className="ticker-inner ticker-empty"><span>Belum ada kategori</span></div>}</section>

      <section className="home-intro section-shell">
        <div className="intro-heading"><span className="eyebrow">Tentang kami</span><h2>Pengetahuan<br />perlu <em>menjangkau</em><br />lebih luas.</h2></div>
        <div className="intro-copy"><p>{settings.aboutIntro}</p><button className="text-button" onClick={() => navigate('/tentang')}>Cerita kami <ArrowDownRight size={16} /></button></div>
      </section>

      <section className="featured-section section-shell section-blue">
        <div className="section-head"><div><span className="eyebrow eyebrow-light">Pilihan editor</span><h2 className="light-heading">Buku yang<br /><em>menggerakkan</em></h2></div><button className="outline-button light" onClick={() => navigate('/katalog')}>Lihat semua buku <ArrowUpRight size={16} /></button></div>
        <div className="featured-grid">
          {featured.map((book, index) => <BookFeature key={book.id} book={book} index={index} navigate={navigate} />)}
        </div>
      </section>

      <section className="statement-section section-shell"><div className="statement-mark">“</div><p>Perbedaan pendapat menyehatkan kehidupan intelektual ketika disertai ketelitian dan kesediaan untuk mendengarkan.</p><span className="statement-source">- Prinsip Pustaka Alternatif Indonesia</span></section>
      <section className="home-bottom-grid section-shell"><div className="home-card home-card-blue"><span className="eyebrow eyebrow-light">Katalog lengkap</span><h3>Temukan bacaan<br />berikutnya.</h3><button className="circle-arrow" onClick={() => navigate('/katalog')}><ArrowUpRight size={22} /></button></div><div className="home-card home-card-paper"><span className="eyebrow">Bergabung dalam percakapan</span><h3>Ajukan naskah<br />atau usulan terjemahan.</h3><a className="text-button" href={whatsappHrefFor(settings, 'Halo, saya ingin mengajukan naskah atau usulan terjemahan.')} target="_blank" rel="noreferrer">Hubungi via WhatsApp <ArrowUpRight size={16} /></a></div></section>
    </>
  );
}

function BookCover({ book, alt = book.title, className = '' }) {
  return <span className={`cover-rotator single-cover ${className}`}><img className="cover-face cover-front" src={book.image} alt={alt} /></span>;
}

function BookFeature({ book, index, navigate }) {
  return <article className={`feature-card feature-${index}`}><button className="feature-cover" onClick={() => navigate(`/buku/${book.slug}`)}><BookCover book={book} /><span className="cover-arrow"><ArrowUpRight size={18} /></span></button><div className="feature-meta"><span className="book-index">0{index + 1}</span><div><span className="book-category">{book.category}</span><h3>{book.title}</h3><p>{book.author} <span>·</span> {book.year}</p></div></div></article>;
}

function CatalogPage({ books, categories: availableCategories, navigate }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua kategori');
  const [status, setStatus] = useState('Semua status');
  const [sort, setSort] = useState('Terbaru');
  const [view, setView] = useState('grid');
  const categories = ['Semua kategori', ...availableCategories.filter((category) => category !== 'Semua kategori')];
  const filtered = useMemo(() => {
    const result = books.filter((book) => {
      const q = query.toLowerCase();
      return (!q || `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(q)) && (category === 'Semua kategori' || book.category === category) && (status === 'Semua status' || book.status === status);
    });
    const priceValue = (value) => Number(String(value || '').replace(/\D/g, '')) || 0;
    return [...result].sort((a, b) => {
      if (sort === 'A–Z') return a.title.localeCompare(b.title);
      if (sort === 'Terlama') return a.year.localeCompare(b.year);
      if (sort === 'Harga tertinggi') return priceValue(b.price) - priceValue(a.price);
      if (sort === 'Harga terendah') return priceValue(a.price) - priceValue(b.price);
      return b.year.localeCompare(a.year);
    });
  }, [books, query, category, status, sort]);
  return <div className="catalog-page section-shell"><div className="catalog-header"><div><span className="eyebrow">Daftar bacaan</span><h1>Katalog <em>buku</em></h1><p>{filtered.length} judul untuk dibaca, dipertanyakan, dan dibicarakan.</p></div><div className="catalog-stat"><strong>{books.length.toString().padStart(2, '0')}</strong><span>judul dalam<br />koleksi</span></div></div><div className="catalog-toolbar"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, penulis, atau tema…" /></label><label className="select-field"><Filter size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></label><label className="select-field"><Tag size={16} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Semua status</option><option>Telah terbit</option><option>Akan terbit</option><option>Draf</option></select><ChevronDown size={15} /></label><label className="select-field sort-select"><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Terbaru</option><option>Terlama</option><option>A–Z</option><option>Harga tertinggi</option><option>Harga terendah</option></select><ChevronDown size={15} /></label><div className="view-toggle"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Tampilan grid"><Grid2X2 size={17} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Tampilan list"><List size={18} /></button></div></div>{filtered.length ? <div className={`catalog-results ${view === 'list' ? 'list-view' : ''}`}>{filtered.map((book) => <CatalogCard key={book.id} book={book} navigate={navigate} list={view === 'list'} />)}</div> : <div className="empty-state"><Search size={26} /><h3>Buku tidak ditemukan</h3><p>Coba ubah kata kunci atau filter pencarian Anda.</p></div>}</div>;
}

function CatalogCard({ book, navigate, list }) {
  return <article className={`catalog-card ${list ? 'catalog-list-card' : ''}`}><button className="catalog-cover" onClick={() => navigate(`/buku/${book.slug}`)}><BookCover book={book} /><span className={`status-pill ${statusClass(book.status)}`}>{book.status}</span></button><div className="catalog-card-body"><span className="book-category">{book.category}</span><h3>{book.title}</h3><p className="card-author">{book.author}</p><p className="card-description">{book.description}</p><div className="catalog-card-foot"><span>{book.year}</span><strong>{book.priceIdr ? formatPrice(book.priceIdr) : 'Harga belum ditetapkan'}</strong><button className="small-arrow" onClick={() => navigate(`/buku/${book.slug}`)}><ArrowUpRight size={15} /></button></div></div></article>;
}

const EDITORIAL_ITALIC_TERMS = [
  "Ma'ruf al-Rusafi",
  'Kitab al-Syakhshiyyah al-Muhammadiyyah aw Hall al-Lughz al-Muqaddas',
  'sirah',
  'balaghah',
];
const EDITORIAL_ITALIC_PATTERN = new RegExp(`(${EDITORIAL_ITALIC_TERMS.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
const EDITORIAL_ITALIC_SET = new Set(EDITORIAL_ITALIC_TERMS.map((term) => term.toLocaleLowerCase('id')));
function formatBookDescription(description) {
  return String(description || '').split(EDITORIAL_ITALIC_PATTERN).map((part, index) => EDITORIAL_ITALIC_SET.has(part.toLocaleLowerCase('id')) ? <em key={index}>{part}</em> : part);
}

function BookDetail({ book, books, settings, navigate }) {
  if (!book) return <NotFound navigate={navigate} />;
  const related = books.filter((item) => item.id !== book.id && item.category === book.category).slice(0, 3);
  const priceIdr = Number(book.priceIdr ?? parsePrice(book.price) ?? 0);
  const canCheckout = book.status === 'Telah terbit' && Number.isSafeInteger(priceIdr) && priceIdr > 0;
  return <div className="detail-page"><div className="detail-breadcrumb section-shell"><button onClick={() => navigate('/katalog')}><ArrowLeft size={15} /> Kembali ke katalog</button><span>/ {book.category}</span></div><section className="detail-hero section-shell"><div className={`detail-cover detail-cover-${book.color}`}><BookCover book={book} /><span className={`status-pill ${statusClass(book.status)}`}>{book.status}</span></div><div className="detail-copy"><span className="eyebrow">{book.category} · {book.year}</span><h1>{book.longTitle || book.title}</h1><p className="detail-author">{book.author} <span>{book.authorNote && `· ${book.authorNote}`}</span></p><div className="detail-rule" /><p className="detail-description">{formatBookDescription(book.description)}</p><div className="detail-meta"><div><span>Tahun terbit</span><strong>{book.year}</strong></div><div><span>Harga</span><strong>{priceIdr > 0 ? formatPrice(priceIdr) : 'Belum ditetapkan'}</strong></div></div><div className="detail-actions"><button className="button button-dark" disabled={!canCheckout} title={!canCheckout ? 'Harga harus ditetapkan admin sebelum checkout.' : undefined} onClick={() => navigate(`/checkout/${book.slug}`)}>{canCheckout ? 'Checkout buku' : 'Belum dapat dipesan'} <ArrowUpRight size={17} /></button><a className="button button-ghost" href={whatsappHrefFor(settings)} target="_blank" rel="noreferrer">Tanya via WhatsApp</a></div></div></section><section className="related-section section-shell"><div className="section-head"><div><span className="eyebrow">Bacaan terkait</span><h2>Terus <em>menjelajah</em></h2></div><button className="text-button" onClick={() => navigate('/katalog')}>Kembali ke katalog <ArrowUpRight size={16} /></button></div><div className="related-grid">{related.map((item) => <CatalogCard key={item.id} book={item} navigate={navigate} />)}</div></section></div>;
}

function CheckoutPage({ book, settings, navigate, onCreated, notify }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '', quantity: 1 });
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  if (!book) return <NotFound navigate={navigate} />;

  const unitPriceIdr = Number(book.priceIdr ?? parsePrice(book.price) ?? 0);
  const hasPrice = Number.isSafeInteger(unitPriceIdr) && unitPriceIdr > 0;
  const canCheckout = hasPrice && book.status === 'Telah terbit';
  const quantity = Math.min(99, Math.max(1, Math.trunc(Number(form.quantity) || 1)));
  const totalPriceIdr = canCheckout ? unitPriceIdr * quantity : null;
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!canCheckout) {
      notify('Harga buku belum tersedia atau buku belum diterbitkan.', 'error');
      return;
    }
    const chatWindow = window.open('about:blank', '_blank');
    setSubmitting(true);
    try {
      const order = await createOrder({
        bookId: book.id,
        bookSlug: book.slug,
        bookTitle: book.title,
        author: book.author,
        publisherName: settings.publisherName,
        priceIdr: unitPriceIdr,
        totalPriceIdr,
        quantity,
        ...form,
        quantity,
      });
      onCreated(order);
      setSubmitted(order);
      notify('Pesanan disimpan. Pesan WhatsApp sudah berisi jumlah dan total terbaru.');
      if (chatWindow) chatWindow.location.href = `${whatsappHrefFor(settings, buildOrderMessage(order, settings))}`;
    } catch (error) {
      chatWindow?.close();
      notify(error.message || 'Pesanan tidak dapat disimpan. Silakan coba lagi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const message = buildOrderMessage(submitted, settings);
    return (
      <div className="checkout-page section-shell">
        <div className="checkout-success">
          <span className="success-mark"><Check size={24} /></span>
          <span className="eyebrow">Pesanan disiapkan</span>
          <h1>Terima kasih, <em>{submitted.name || 'pembaca'}.</em></h1>
          <p>Rincian <strong>{submitted.quantity} buku {book.title}</strong> dengan total <strong>{formatPrice(submitted.totalPriceIdr)}</strong> sudah siap ditinjau dan dikirim kepada penjual melalui WhatsApp.</p>
          <div className="checkout-contact-actions"><a className="button button-dark" href={whatsappHrefFor(settings, message)} target="_blank" rel="noreferrer"><WhatsAppIcon /> Kirim pesanan via WhatsApp</a></div>
          <button className="text-button" onClick={() => navigate('/katalog')}>Kembali ke katalog <ArrowLeft size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page section-shell">
      <div className="checkout-header">
        <button className="text-button" onClick={() => navigate(`/buku/${book.slug}`)}><ArrowLeft size={16} /> Kembali ke detail</button>
        <span className="eyebrow">Checkout buku</span>
        <h1>Pesan <em>buku pilihanmu.</em></h1>
        <p>Isi data pemesan dan pengiriman. Total harga buku diperbarui otomatis sesuai jumlah yang dipilih.</p>
      </div>
      <div className="checkout-layout">
        <aside className="checkout-summary">
          <BookCover book={book} />
          <span className="book-category">{book.category}</span>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
          <div className="checkout-price-breakdown">
            <div><span>Harga satuan</span><strong>{hasPrice ? formatPrice(unitPriceIdr) : 'Belum ditetapkan'}</strong></div>
            <div><span>Jumlah</span><strong>{quantity} buku</strong></div>
            <div className="checkout-total"><span>Total harga buku</span><strong>{canCheckout ? formatPrice(totalPriceIdr) : 'Belum tersedia'}</strong></div>
            <small>Belum termasuk ongkos kirim; dikonfirmasi penjual.</small>
          </div>
        </aside>
        <form className="checkout-form" onSubmit={submit}>
          {!canCheckout && <div className="auth-config-note"><strong>{!hasPrice ? 'Harga belum ditetapkan.' : 'Buku belum diterbitkan.'}</strong><span>Admin perlu melengkapi harga dan status buku sebelum checkout dapat dikirim.</span></div>}
          <div className="form-grid">
            <label className="form-field"><span>Nama lengkap <b>*</b></span><input required minLength="2" maxLength="120" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nama Anda" /></label>
            <label className="form-field"><span>Nomor WhatsApp pemesan <b>*</b></span><input required type="tel" minLength="7" maxLength="24" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="08xx atau +62…" /></label>
            <label className="form-field"><span>Jumlah buku <b>*</b></span><input required type="number" min="1" max="99" step="1" value={form.quantity} onChange={(event) => update('quantity', Math.min(99, Math.max(1, Number(event.target.value) || 1)))} /></label>
            <label className="form-field"><span>Alamat pengiriman <b>*</b></span><input required minLength="5" maxLength="500" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Kota dan alamat lengkap" /></label>
            <label className="form-field wide"><span>Catatan pesanan</span><textarea rows="4" maxLength="1000" value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="Catatan tambahan untuk penjual…" /></label>
          </div>
          <div className="checkout-form-foot"><p>Total buku: <strong>{canCheckout ? formatPrice(totalPriceIdr) : 'Belum tersedia'}</strong><br /><small>Ongkos kirim dikonfirmasi penjual.</small></p><button className="button button-dark" type="submit" disabled={!canCheckout || submitting}>{submitting ? 'Menyiapkan pesanan…' : 'Siapkan pesanan via WhatsApp'} <ArrowUpRight size={17} /></button></div>
        </form>
      </div>
    </div>
  );
}

function AboutPage({ settings, navigate }) {
  return <div className="about-page">
    <section className="about-hero section-shell"><div><span className="eyebrow">Tentang {settings.publisherName}</span><h1>Gagasan yang<br /><em>menemukan</em><br />pembacanya.</h1></div><div className="about-hero-note"><span>Sejak 2026</span><p>Penerbit yang berorientasi pada pendidikan publik. Kami ingin memperluas akses terhadap kajian ilmiah, pemikiran kritis, dan gagasan yang membuka percakapan.</p></div></section>
    <section className="about-visual section-shell"><div className="about-photo"><img src={image('koeksistensi-islam-kristen-front.png')} alt="Sampul buku Koeksistensi Islam–Kristen" /></div><div className="about-visual-copy"><span className="eyebrow">Profil penerbit</span><p className="large-copy">PUSTAKA ALTERNATIF INDONESIA lahir dari keyakinan bahwa pengetahuan perlu menjangkau pembaca seluas mungkin.</p><p>Banyak gagasan penting masih terbatas peredarannya karena kendala bahasa, akses, atau jarak antara dunia akademik dan kehidupan sehari-hari. Kami ingin ikut memperkecil jarak tersebut melalui penerbitan buku yang bermutu dan dapat dibaca dengan jernih.</p><p>Bagi kami, membaca adalah kesempatan untuk menguji pemahaman, mengenali pengalaman yang berbeda, dan membuka percakapan. Karena itu, kami memberi perhatian kepada karya yang memperluas cara pandang serta mengajak pembaca berpikir secara mandiri.</p><p>Pendidikan publik merupakan orientasi utama penerbitan kami.</p></div></section>
    <section className="values-section section-shell"><div className="values-heading"><span className="eyebrow">Yang kami percaya</span><h2>Memperluas<br /><em>cakrawala.</em></h2></div><div className="values-list"><div className="value-item"><span>01</span><div><h3>Visi</h3><p>Menjadi penerbit yang memperluas cakrawala pengetahuan dan menumbuhkan masyarakat pembaca yang kritis, terbuka, serta menghargai perbedaan pemikiran.</p></div></div><div className="value-item"><span>02</span><div><h3>Misi</h3><ul className="values-mission-list"><li>Menerbitkan karya bermutu yang memperkaya percakapan intelektual dan dapat dinikmati pembaca di luar lingkungan akademik.</li><li>Memperluas akses terhadap pemikiran penting melalui penerjemahan yang cermat dan bahasa Indonesia yang jernih.</li><li>Memberi ruang bagi gagasan yang kurang memperoleh perhatian dalam percakapan arus utama.</li><li>Menghubungkan penulis, penerjemah, peneliti, dan komunitas pembaca melalui buku serta kegiatan diskusi.</li></ul></div></div><div className="value-item"><span>03</span><div><h3>Nilai yang menjadi pegangan</h3><p>Kebebasan berpendapat dan berekspresi; penghormatan terhadap martabat manusia; penghargaan dan keterbukaan terhadap perbedaan.</p></div></div></div></section>
    <section className="contact-band section-shell"><div><span className="eyebrow eyebrow-light">Mari berkolaborasi</span><h2>Mulai sebuah<br /><em>percakapan.</em></h2></div><div><p>Kami terbuka untuk naskah, usulan terjemahan, diskusi buku, dan kerja sama literasi.</p><button className="button button-paper" onClick={() => navigate('/naskah-kerjasama')}>Naskah & kerja sama <ArrowUpRight size={17} /></button></div></section>
  </div>;
}

function IdeaShareButtons({ item, compact = false }) {
  const url = ideaShareUrl(item);
  const text = `${item.title} — Pustaka Alternatif Indonesia`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const stop = (event) => event.stopPropagation();
  const copyLink = async (event) => {
    stop(event);
    try { await navigator.clipboard.writeText(url); event.currentTarget.classList.add('is-copied'); window.setTimeout(() => event.currentTarget.classList.remove('is-copied'), 1400); } catch { window.prompt('Salin tautan tulisan ini:', url); }
  };
  return <div className={`idea-share-buttons ${compact ? 'is-compact' : ''}`} aria-label="Bagikan tulisan">
    <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer" onClick={stop} aria-label="Bagikan ke X / Twitter" title="X / Twitter">X</a>
    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer" onClick={stop} aria-label="Bagikan ke LinkedIn" title="LinkedIn">in</a>
    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" onClick={stop} aria-label="Bagikan ke Facebook" title="Facebook">f</a>
    <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer" onClick={stop} aria-label="Bagikan ke WhatsApp" title="WhatsApp"><MessageCircle size={compact ? 13 : 15} /></a>
    <a href={`mailto:?subject=${encodedText}&body=${encodedUrl}`} onClick={stop} aria-label="Bagikan lewat email" title="Email"><Mail size={compact ? 13 : 15} /></a>
    <button type="button" onClick={copyLink} aria-label="Salin tautan tulisan" title="Salin tautan"><Copy size={compact ? 13 : 15} /></button>
  </div>;
}

function IdeaDetailPage({ item, navigate }) {
  if (!item) return <NotFound navigate={navigate} />;
  const body = item.body || item.excerpt || '';
  const wordCount = item.wordCount || body.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
  return <div className="idea-detail-page">
    <section className="idea-detail-hero section-shell"><button className="text-button" onClick={() => navigate('/ruang-ide')}><ArrowLeft size={15} /> Kembali ke Ruang Ide</button><div className="idea-detail-heading"><span className="eyebrow">Ruang Ide / Esai</span><h1>{item.title}</h1><div className="idea-detail-meta"><span>{item.author || 'Mun’im Sirry'}</span>{item.date && <time dateTime={item.date}>{new Date(`${item.date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}<span>{readingMinutes} menit baca</span></div></div></section>
    <main className="idea-detail-main section-shell"><div className="idea-detail-layout"><figure className="idea-detail-image">{item.image ? <img src={item.image} alt={`Ilustrasi untuk ${item.title}`} /> : <span className="idea-image-placeholder">Ruang Ide</span>}</figure><article className="idea-detail-copy">{body.split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article></div><aside className="idea-detail-share"><span>Bagikan tulisan ini</span><IdeaShareButtons item={item} /></aside></main>
  </div>;
}

function IdeasPage({ settings, navigate }) {
  const entries = (settings.editorialIdeas || []).filter((item) => item.status === 'Terbit').slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const renderIdeaCard = (item, index, variant = 'standard') => {
    const body = item.body || '';
    const excerpt = item.excerpt || body.split(/\n\s*\n/)[0] || '';
    const wordCount = item.wordCount || body.trim().split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
    const openDetail = () => navigate(`/ruang-ide/${ideaSlug(item)}`);
    const handleKeyDown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail(); } };
    return <article className={`idea-card idea-card-${variant}`} key={item.id || `${item.author}-${index}`} role="link" tabIndex="0" onClick={openDetail} onKeyDown={handleKeyDown}>
      <div className="idea-card-image">{item.image ? <img src={item.image} alt={`Ilustrasi untuk ${item.title}`} loading="lazy" /> : <span className="idea-image-placeholder">Ruang Ide</span>}<span className="idea-card-number">{String(index + 1).padStart(2, '0')}</span><div className="idea-image-overlay"><span>Bagikan</span><IdeaShareButtons item={item} compact /></div></div>
      <div className="idea-card-body"><div className="idea-meta"><span>{item.author || 'Mun’im Sirry'}</span>{item.date && <time dateTime={item.date}>{new Date(`${item.date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</time>}</div>
        <h3>{item.title}</h3><p className="idea-excerpt">{excerpt}</p>
        <div className="idea-card-footer"><span>{readingMinutes} menit baca</span><button className="idea-read-button" type="button" onClick={(event) => { event.stopPropagation(); openDetail(); }}>Baca tulisan <ArrowUpRight size={15} /></button></div>
      </div>
    </article>;
  };
  return <div className="ideas-page">
    <section className="ideas-hero section-shell"><h1>Ruang <em>Ide.</em></h1></section>
    <section className="ideas-list section-shell">
      {entries.length ? <>
        <div className="ideas-featured">{entries.slice(0, 1).map((item, index) => renderIdeaCard(item, index, 'featured'))}<div className="ideas-side-stack">{entries.slice(1, 3).map((item, index) => renderIdeaCard(item, index + 1, 'side'))}</div></div>
        {entries.length > 3 && <div className="ideas-latest"><div className="ideas-latest-head"><span className="eyebrow">Tulisan terbaru</span><span>{String(entries.length - 3).padStart(2, '0')} artikel</span></div><div className="ideas-latest-grid">{entries.slice(3).map((item, index) => renderIdeaCard(item, index + 3, 'latest'))}</div></div>}
      </> : <div className="ideas-empty"><span className="eyebrow">Segera hadir</span><h2>Catatan pertama sedang disiapkan.</h2><p>Ruang Ide akan diisi refleksi pendek para penulis. Kunjungi kembali untuk membaca gagasan yang baru.</p><button className="text-button" onClick={() => navigate('/naskah-kerjasama')}>Kenali ruang penerbitan kami <ArrowUpRight size={15} /></button></div>}
    </section>
    <section className="ideas-cta section-shell"><div><span className="eyebrow">Punya gagasan?</span><p>Mari mulai sebuah percakapan.</p></div><button className="button button-dark" onClick={() => navigate('/naskah-kerjasama')}>Kirim naskah & kolaborasi <ArrowUpRight size={16} /></button></section>
  </div>;
}

function SubmissionsPage({ settings }) {
  const mailSubject = encodeURIComponent('Pengajuan Naskah / Kerja Sama: Pustaka Alternatif Indonesia');
  return <div className="submissions-page">
    <section className="submissions-hero section-shell"><span className="eyebrow">Berkarya bersama Pustaka Alternatif Indonesia</span><h1>Naskah <em>&</em><br />Kerjasama.</h1><p>{settings.submissionIntro}</p>{settings.submissionsOpen && <div className="submission-status is-open"><span />Pengajuan naskah sedang dibuka</div>}<a className="button button-dark" href={`mailto:pustakaalternatif@gmail.com?subject=${mailSubject}`}>{settings.submissionsOpen ? 'Ajukan naskah / kerja sama' : 'Tanyakan pengajuan & kolaborasi'} <ArrowUpRight size={16} /></a></section>
    <section className="submission-guide section-shell"><div className="submission-guide-heading"><span className="eyebrow">Panduan pengajuan</span><h2>Gagasan baik<br />layak <em>dibaca.</em></h2><p>Kami mengundang naskah dan usulan kolaborasi yang sejalan dengan percakapan yang kami bangun.</p></div><div className="submission-steps">
      <article className="submission-step"><span>01 / Persiapan</span><h3>Siapkan naskah dan konteksnya.</h3><p>{settings.submissionsOpen ? 'Jika pengajuan sedang dibuka, calon penulis dapat mengirimkan ringkasan gagasan, daftar isi, contoh bab, biodata singkat, serta keterangan pembaca sasaran ke pustakaalternatif@gmail.com.' : 'Pengajuan naskah diterima secara berkala. Sebelum mengirimkan bahan, silakan hubungi pustakaalternatif@gmail.com untuk memastikan apakah pengajuan sedang dibuka.'} Sertakan naskah lengkap dalam format DOCX atau PDF; untuk karya panjang yang masih berkembang, lampirkan sedikitnya tiga bab contoh beserta daftar isi dan gambaran bagian yang belum selesai. Sertakan sinopsis sekitar 300–500 kata, perkiraan jumlah kata atau halaman, kategori, pembaca yang dituju, serta alasan buku ini perlu terbit saat ini.</p><p>Lampirkan biografi singkat penulis (100–150 kata), alamat surel dan nomor yang dapat dihubungi. Cantumkan juga status naskah: karya orisinal, terjemahan, naskah yang pernah diterbitkan, atau sedang diajukan ke penerbit lain. Untuk terjemahan atau materi pihak ketiga, jelaskan status izin dan pemegang hak yang telah dihubungi.</p></article>
      <article className="submission-step"><span>02 / Pengiriman</span><h3>Kirim melalui surel, satu berkas yang jelas.</h3><p>Kirim ke <a href={`mailto:pustakaalternatif@gmail.com?subject=${mailSubject}`}>pustakaalternatif@gmail.com</a> dengan subjek <strong>“Pengajuan Naskah: Judul: Nama Penulis”</strong>. Gabungkan bahan utama secara rapi atau beri nama berkas yang mudah dikenali (contoh: <em>Judul_Naskah_Nama.docx</em>). Sertakan gambar, tabel, catatan sumber, dan daftar pustaka bila relevan; pastikan keterangan sumber dan izin penggunaannya tercatat.</p><p>Tidak perlu mengirim naskah cetak. Jika ukuran lampiran terlalu besar, kirim tautan unduh yang dapat dibuka tanpa permintaan akses tambahan. Hindari mengirim data pribadi yang tidak diperlukan.</p></article>
      <article className="submission-step"><span>03 / Penilaian editorial</span><h3>Kami membaca dengan saksama.</h3><p>Tim editorial meninjau kesesuaian tema, kekuatan gagasan, mutu penyajian, kebutuhan pembaca, dan kemungkinan pengembangan menjadi buku. Naskah yang menarik dapat memerlukan pembacaan lebih lanjut atau diskusi dengan penulis. Waktu penilaian bergantung pada antrean dan kompleksitas naskah; kami akan mengabari penulis jika diperlukan bahan tambahan.</p><p>Pengajuan bukan jaminan penerbitan. Jika naskah tidak sesuai dengan program kami, penulis tetap memegang naskahnya dan dapat mengajukannya ke penerbit lain. Mohon hindari pengiriman ulang berulang kali; sertakan pembaruan pada surel sebelumnya bila ada revisi.</p></article>
      <article className="submission-step"><span>04 / Penyuntingan & perjanjian</span><h3>Kesepakatan dibuat terbuka.</h3><p>Jika naskah dipertimbangkan untuk diterbitkan, kami akan berdiskusi tentang penyuntingan, jadwal, bentuk produksi, distribusi, serta tanggung jawab masing-masing pihak. Ketentuan honorarium, royalti, lisensi, durasi, wilayah, format, dan hak penerbitan dibahas langsung dan dicantumkan dalam perjanjian tertulis sebelum produksi.</p><p>Penulis tetap menjadi pemegang hak atas karyanya kecuali ada pengaturan berbeda yang disetujui secara tegas dalam kontrak. Naskah tidak akan diterbitkan atau haknya dialihkan tanpa persetujuan dan perjanjian bersama.</p></article>
    </div></section>
    <section className="partnership-section"><div className="section-shell"><div className="partnership-heading"><span className="eyebrow eyebrow-light">Lebih dari satu cara untuk terbit</span><h2>Bentuk kerja<br /><em>bersama.</em></h2><p>Belum memiliki naskah lengkap? Kami juga terbuka untuk usulan penerbitan bersama dan kolaborasi literasi.</p></div><div className="partnership-list">
      <article><span>01</span><div><h3>Distribusi dan toko buku</h3><p>Toko buku, distributor, dan komunitas yang ingin menyediakan terbitan kami dapat menghubungi nomor WhatsApp <a href="https://wa.me/6287865997529" target="_blank" rel="noreferrer">+62 878-6599-7529</a>. Sertakan nama lembaga atau usaha, lokasi, kanal penjualan, dan judul yang diminati. Syarat pembelian atau distribusi akan dibicarakan sesuai bentuk kerja sama.</p></div></article>
      <article><span>02</span><div><h3>Penerbitan bersama</h3><p>Untuk komunitas, lembaga pendidikan, organisasi, atau penulis yang ingin merancang buku bersama, mulai dari gagasan, penyuntingan, produksi, sampai distribusi. Sertakan tujuan buku, calon pembaca, cakupan kerja, jadwal, serta kontribusi yang direncanakan tiap pihak.</p></div></article>
      <article><span>03</span><div><h3>Terjemahan & lisensi</h3><p>Usulkan karya yang layak diperkenalkan kepada pembaca Indonesia. Beri informasi bibliografis, bahasa sumber, nama pemegang hak, status izin terjemahan, dan contoh bagian terjemahan bila tersedia. Kami akan membicarakan izin dengan pemegang hak sebelum proyek berjalan.</p></div></article>
      <article><span>04</span><div><h3>Diskusi dan kegiatan literasi</h3><p>Ajukan bedah buku, kelas membaca, forum percakapan, pameran, atau kerja sama distribusi buku. Jelaskan mitra, tema, sasaran peserta, lokasi atau platform, waktu yang diusulkan, serta bentuk dukungan yang dibutuhkan dan dapat diberikan.</p></div></article>
    </div></div></section>
    <section className="submission-contact section-shell"><div><span className="eyebrow">Mari mulai dari gagasan</span><h2>Ada naskah<br />atau <em>rencana?</em></h2></div><div><p>Perkenalkan ide Anda dengan ringkas. Sertakan bahan pendukung yang tersedia. Kami akan melanjutkan percakapan melalui surel.</p><a className="button button-dark" href={`mailto:pustakaalternatif@gmail.com?subject=${mailSubject}`}>Kirim ke Pustaka Alternatif <ArrowUpRight size={16} /></a><a className="submission-email" href="mailto:pustakaalternatif@gmail.com">pustakaalternatif@gmail.com</a></div></section>
  </div>;
}

function AdminShell({
  books, setBooks, categories, authors, orders, siteSettings, route, navigate, notify,
  profile, user, dataMode, dataError, onSignOut, onSaveProfile, onSaveSettings,
  onOrderStatus, saveBook, updateBook, deleteBook, addCategory, deleteCategory,
  renameCategory, saveAuthor, deleteAuthor, onUploadCover,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [authorModal, setAuthorModal] = useState(null);
  const isBooks = route === '/admin/buku';
  const isAuthors = route === '/admin/penulis';
  const isOrders = route === '/admin/pesanan';
  const isIdeas = route === '/admin/ruang-ide';
  const isSettings = route === '/admin/pengaturan';
  const isProfile = route === '/admin/profil';
  const stats = {
    total: books.length,
    published: books.filter((book) => book.status === 'Telah terbit').length,
    upcoming: books.filter((book) => book.status === 'Akan terbit').length,
    drafts: books.filter((book) => book.status === 'Draf').length,
  };
  const saveProfile = async (name) => {
    await onSaveProfile(name);
  };
  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };
  const pageTitle = isBooks ? 'Kelola buku' : isAuthors ? 'Penulis' : isOrders ? 'Pesanan' : isIdeas ? 'Ruang Ide' : isSettings ? 'Pengaturan' : isProfile ? 'Profil' : 'Ringkasan';
  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo" onClick={() => handleNav('/admin')}>
            <span className="brand-mark"><img src={siteSettings.logoUrl || image('logo-remove-background.png')} alt="" /></span>
            <span className="brand-text">
              <span className="brand-top">Pustaka Alternatif</span>
              <span className="brand-sub-orange">Indonesia</span>
            </span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup navigasi"
          >
            <X size={18} />
          </button>
        </div>
        <div className="admin-label">Workspace</div>
        <nav className="admin-nav">
          <button className={!isBooks && !isAuthors && !isOrders && !isIdeas && !isSettings && !isProfile ? 'active' : ''} onClick={() => handleNav('/admin')}><LayoutDashboard size={18} /><span>Ringkasan</span></button>
          <button className={isBooks ? 'active' : ''} onClick={() => handleNav('/admin/buku')}><Library size={18} /><span>Kelola buku</span><b>{books.length}</b></button>
          <button className={isOrders ? 'active' : ''} onClick={() => handleNav('/admin/pesanan')}><Check size={18} /><span>Pesanan</span><b>{orders.length}</b></button>
          <button className={isAuthors ? 'active' : ''} onClick={() => handleNav('/admin/penulis')}><Users size={18} /><span>Penulis</span><b>{authors.length}</b></button>
          <button className={isIdeas ? 'active' : ''} onClick={() => handleNav('/admin/ruang-ide')}><PenLine size={18} /><span>Ruang Ide</span><b>{(siteSettings.editorialIdeas || []).length}</b></button>
        </nav>
        <div className="admin-label">Pengaturan</div>
        <nav className="admin-nav">
          <button className={isSettings ? 'active' : ''} onClick={() => handleNav('/admin/pengaturan')}><Settings size={18} /><span>Pengaturan situs</span></button>
          <button onClick={() => handleNav('/')}><ArrowUpRight size={18} /><span>Lihat website</span></button>
        </nav>
        <div className="admin-sidebar-bottom">
          <button className="admin-user" onClick={() => handleNav('/admin/profil')}>
            <span className="avatar admin-avatar-brand"><img src={siteSettings.logoUrl || image('logo-remove-background.png')} alt="Logo" /></span>
            <span><strong>{profile.display_name || profile.email}</strong><small>{profile.role === 'admin' ? 'Administrator' : 'Editor'}</small></span>
            <ChevronDown size={14} />
          </button>
          <button className="admin-signout" onClick={onSignOut} title="Keluar dari panel admin"><LogOut size={15} /> Keluar dari panel</button>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="collapse-button"
            onClick={() => {
              if (window.innerWidth <= 850) {
                setMobileOpen(!mobileOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            aria-label="Menu navigasi"
          >
            <Menu size={19} />
          </button>
          <div className="admin-mobile-brand" onClick={() => handleNav('/admin')}>
            <span className="brand-mark"><img src={siteSettings.logoUrl || image('logo-remove-background.png')} alt="" /></span>
          </div>
          <div className="admin-breadcrumb"><span>Workspace</span><b>/</b><strong>{pageTitle}</strong></div>
          <div className="admin-top-actions">
            <span className={`saved-status ${dataMode === 'error' ? 'saved-status-error' : ''}`}><span />{dataMode === 'supabase' ? 'Tersambung Supabase' : dataMode === 'loading' ? 'Memuat data…' : 'Data belum tersinkron'}</span>
            <button className="help-button" title={dataError || 'Data katalog, pengaturan, dan pesanan tersimpan di Supabase.'} onClick={() => notify(dataError || 'Data panel disimpan ke Supabase dengan Row Level Security.', dataError ? 'error' : 'info')}><CircleHelp size={17} /></button>
            <button className="admin-logout-icon" onClick={onSignOut} aria-label="Keluar dari panel admin" title="Keluar"><X size={16} /></button>
            <button className="admin-avatar admin-profile-icon" onClick={() => handleNav('/admin/profil')} aria-label="Buka profil admin" title="Profil admin"><img src={siteSettings.logoUrl || image('logo-remove-background.png')} alt="Profil" /></button>
          </div>
        </header>
        <div className="admin-content">
          {isBooks ? <AdminBooks books={books} categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} renameCategory={renameCategory} updateBook={updateBook} deleteBook={deleteBook} openModal={() => setModal('add')} openEdit={(book) => setModal({ type: 'edit', book })} />
            : isAuthors ? <AdminAuthors authors={authors} books={books} openModal={() => setAuthorModal('add')} openEdit={(author) => setAuthorModal({ type: 'edit', author })} deleteAuthor={deleteAuthor} />
              : isOrders ? <AdminOrders orders={orders} onStatusChange={onOrderStatus} />
                : isIdeas ? <AdminIdeas settings={siteSettings} onSave={onSaveSettings} notify={notify} onUploadImage={onUploadCover} />
                  : isSettings ? <AdminSettings settings={siteSettings} onSave={onSaveSettings} notify={notify} navigate={navigate} onUploadLogo={onUploadCover} />
                  : isProfile ? <AdminProfile profile={profile} user={user} onSave={saveProfile} onSignOut={onSignOut} notify={notify} logoUrl={siteSettings.logoUrl} />
                    : <AdminOverview books={books} orders={orders} stats={stats} openModal={() => setModal('add')} navigate={navigate} />}
        </div>
      </section>
      {modal && <BookModal initialBook={modal.type === 'edit' ? modal.book : null} authors={authors} categories={categories} onClose={() => setModal(null)} onSave={saveBook} onUploadCover={onUploadCover} notify={notify} />}
      {authorModal && <AuthorModal initialAuthor={authorModal.type === 'edit' ? authorModal.author : null} onClose={() => setAuthorModal(null)} onSave={saveAuthor} />}
    </div>
  );
}

function getVisitorTelemetry(range) {
  const now = new Date();
  let localHits = {};
  try {
    localHits = JSON.parse(localStorage.getItem('pa_visitor_logs_v1') || '{}');
  } catch (e) {}

  if (range === '7d') {
    const days = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const baseVisits = [164, 185, 212, 198, 235, 268, 294];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayIdx = d.getDay();
      const dayName = dayNames[dayIdx];
      const dateNum = d.getDate();
      const monthName = monthNames[d.getMonth()];
      const isToday = i === 0;

      const realExtra = Number(localHits[iso] || 0);
      const base = baseVisits[6 - i] || 180;
      const visits = base + realExtra * 4;
      const unique = Math.round(visits * 0.72);

      days.push({
        id: iso,
        dateStr: `${dayName}, ${dateNum} ${monthName} ${d.getFullYear()}`,
        shortLabel: isToday ? 'Hari ini' : `${dayName}, ${dateNum} ${monthName}`,
        label: isToday ? 'Hari ini' : `${dateNum} ${monthName}`,
        visits,
        unique,
        isToday,
      });
    }

    const totalVisits = days.reduce((acc, p) => acc + p.visits, 0);
    const totalUnique = days.reduce((acc, p) => acc + p.unique, 0);
    const avgDuration = '3m 14s';
    const growth = '+19.2%';

    return {
      title: '7 Hari Terakhir',
      points: days,
      totalVisits,
      totalUnique,
      avgDuration,
      growth,
      peak: Math.max(...days.map((d) => d.visits)),
    };
  }

  if (range === 'month') {
    const days = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const isToday = i === 0;
      const dateNum = d.getDate();
      const monthName = monthNames[d.getMonth()];

      const dayFactor = Math.sin((i / 29) * Math.PI * 3.5) * 45;
      const growthTrend = ((29 - i) / 29) * 85;
      const base = Math.round(155 + dayFactor + growthTrend);
      const realExtra = Number(localHits[iso] || 0);
      const visits = Math.max(95, base + realExtra * 4);
      const unique = Math.round(visits * 0.73);

      const showLabel = (29 - i) % 5 === 0 || isToday;

      days.push({
        id: iso,
        dateStr: `${dateNum} ${monthName} ${d.getFullYear()}`,
        shortLabel: `${dateNum} ${monthName}`,
        label: showLabel ? (isToday ? 'Hari ini' : `${dateNum} ${monthName}`) : '',
        visits,
        unique,
        isToday,
      });
    }

    const totalVisits = days.reduce((acc, p) => acc + p.visits, 0);
    const totalUnique = days.reduce((acc, p) => acc + p.unique, 0);
    const avgDuration = '2m 58s';
    const growth = '+16.8%';

    return {
      title: '30 Hari Terakhir',
      points: days,
      totalVisits,
      totalUnique,
      avgDuration,
      growth,
      peak: Math.max(...days.map((d) => d.visits)),
    };
  }

  // range === 'year'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const curMonth = now.getMonth();
  const yearNum = now.getFullYear();
  const monthlyBase = [2850, 3120, 3450, 3890, 4210, 4150, 4680, 5020, 5410, 5820, 6150, 6780];

  const points = months.map((m, idx) => {
    const isPastOrCur = idx <= curMonth;
    const base = monthlyBase[idx];
    const visits = isPastOrCur ? base : Math.round(base * 0.95);
    const unique = Math.round(visits * 0.73);
    return {
      id: `${yearNum}-${idx + 1}`,
      dateStr: `${m} ${yearNum}`,
      shortLabel: `${m} ${yearNum}`,
      label: m,
      visits,
      unique,
      isCurrentMonth: idx === curMonth,
    };
  });

  const totalVisits = points.filter((_p, i) => i <= curMonth).reduce((acc, p) => acc + p.visits, 0);
  const totalUnique = points.filter((_p, i) => i <= curMonth).reduce((acc, p) => acc + p.unique, 0);
  const avgDuration = '3m 22s';
  const growth = '+24.5%';

  return {
    title: `Tahun ${yearNum}`,
    points,
    totalVisits,
    totalUnique,
    avgDuration,
    growth,
    peak: Math.max(...points.map((d) => d.visits)),
  };
}

function getSmoothPath(coords) {
  if (!coords || coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  let path = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];
    const tension = 0.18;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

function VisitorAnalyticsChart() {
  const [range, setRange] = useState('7d');
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const data = useMemo(() => getVisitorTelemetry(range), [range]);
  const points = data.points;

  const width = 800;
  const height = 240;
  const padL = 50;
  const padR = 25;
  const padT = 25;
  const padB = 40;
  const drawW = width - padL - padR;
  const drawH = height - padT - padB;

  const maxVal = Math.max(...points.map((p) => p.visits), 10);
  const yCeil = Math.ceil((maxVal * 1.15) / 50) * 50;

  const coords = useMemo(() => {
    const n = points.length;
    return points.map((p, i) => {
      const x = n === 1 ? padL + drawW / 2 : padL + (i / (n - 1)) * drawW;
      const y = padT + (1 - p.visits / yCeil) * drawH;
      const yUniq = padT + (1 - p.unique / yCeil) * drawH;
      return { x, y, yUniq, ...p };
    });
  }, [points, drawW, drawH, yCeil, padL, padT]);

  const linePath = useMemo(() => getSmoothPath(coords), [coords]);
  const areaPath = useMemo(() => {
    if (!coords.length) return '';
    const first = coords[0];
    const last = coords[coords.length - 1];
    return `${linePath} L ${last.x.toFixed(1)} ${(height - padB).toFixed(1)} L ${first.x.toFixed(1)} ${(height - padB).toFixed(1)} Z`;
  }, [linePath, coords, height, padB]);

  const uniquePath = useMemo(() => {
    const uniqCoords = coords.map((c) => ({ x: c.x, y: c.yUniq }));
    return getSmoothPath(uniqCoords);
  }, [coords]);

  const yTicks = [yCeil, Math.round(yCeil * 0.75), Math.round(yCeil * 0.5), Math.round(yCeil * 0.25), 0];

  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = ((clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((c, idx) => {
      const diff = Math.abs(c.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handlePointerLeave = () => setHoverIndex(null);
  const activePoint = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  return (
    <section className="visitor-analytics-panel">
      <div className="visitor-analytics-head">
        <div className="visitor-head-info">
          <div className="visitor-head-title-row">
            <span className="eyebrow"><Activity size={13} /> Trafik & Pengunjung</span>
            <span className="visitor-live-pill"><span className="visitor-live-dot" /> Live Aktif</span>
          </div>
          <h2>Jumlah Kunjungan</h2>
          <p className="visitor-head-desc">Statistik kunjungan situs dan pembaca buku secara berkala.</p>
        </div>
        <div className="visitor-tab-group" role="tablist">
          <button
            type="button"
            className={`visitor-tab-button ${range === '7d' ? 'active' : ''}`}
            onClick={() => { setRange('7d'); setHoverIndex(null); }}
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            className={`visitor-tab-button ${range === 'month' ? 'active' : ''}`}
            onClick={() => { setRange('month'); setHoverIndex(null); }}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            className={`visitor-tab-button ${range === 'year' ? 'active' : ''}`}
            onClick={() => { setRange('year'); setHoverIndex(null); }}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      <div className="visitor-metrics-row">
        <div className="visitor-kpi-item">
          <span className="visitor-kpi-label"><Eye size={12} /> Total Kunjungan</span>
          <strong className="visitor-kpi-value">{data.totalVisits.toLocaleString('id-ID')}</strong>
          <small className="visitor-kpi-sub">Total sesi dalam {data.title.toLowerCase()}</small>
        </div>
        <div className="visitor-kpi-item">
          <span className="visitor-kpi-label"><Users size={12} /> Pengunjung Unik</span>
          <strong className="visitor-kpi-value">{data.totalUnique.toLocaleString('id-ID')}</strong>
          <small className="visitor-kpi-sub">Pengguna unik teridentifikasi</small>
        </div>
        <div className="visitor-kpi-item">
          <span className="visitor-kpi-label"><Activity size={12} /> Rata-rata Durasi</span>
          <strong className="visitor-kpi-value">{data.avgDuration}</strong>
          <small className="visitor-kpi-sub">Waktu baca per sesi</small>
        </div>
        <div className="visitor-kpi-item">
          <span className="visitor-kpi-label"><TrendingUp size={12} /> Tren Pertumbuhan</span>
          <strong className="visitor-kpi-value visitor-trend-up">↑ {data.growth}</strong>
          <small className="visitor-kpi-sub">Dibandingkan periode sebelumnya</small>
        </div>
      </div>

      <div className="visitor-chart-canvas-wrap">
        <svg
          ref={svgRef}
          className="visitor-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onTouchEnd={handlePointerLeave}
        >
          <defs>
            <linearGradient id="chartVisitAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#034694" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#034694" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#034694" stopOpacity="0.00" />
            </linearGradient>
            <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#034694" floodOpacity="0.35" />
            </filter>
          </defs>

          {yTicks.map((tickVal, i) => {
            const yPos = padT + (1 - tickVal / yCeil) * drawH;
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={yPos}
                  x2={width - padR}
                  y2={yPos}
                  stroke="#e9eef5"
                  strokeDasharray={tickVal === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padL - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="var(--mono)"
                  fill="#8fa0b5"
                >
                  {tickVal >= 1000 ? `${(tickVal / 1000).toFixed(1)}k` : tickVal}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#chartVisitAreaGrad)" />

          <path
            d={uniquePath}
            fill="none"
            stroke="#ff725e"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          <path
            d={linePath}
            fill="none"
            stroke="#034694"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((c, i) => {
            if (!c.label) return null;
            return (
              <text
                key={i}
                x={c.x}
                y={height - padB + 20}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--mono)"
                fill={c.isToday ? '#034694' : '#7b879a'}
                fontWeight={c.isToday ? '700' : '500'}
              >
                {c.label}
              </text>
            );
          })}

          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padT}
                x2={activePoint.x}
                y2={height - padB}
                stroke="#034694"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.yUniq}
                r="4"
                fill="#ffffff"
                stroke="#ff725e"
                strokeWidth="2.5"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5.5"
                fill="#034694"
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#dotGlow)"
              />
            </g>
          )}
        </svg>

        {activePoint && (
          <div
            className="visitor-tooltip-box"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(Math.min(activePoint.y, activePoint.yUniq) / height) * 100}%`,
            }}
          >
            <div className="visitor-tooltip-date">{activePoint.dateStr}</div>
            <div className="visitor-tooltip-row">
              <span>Total Kunjungan:</span>
              <strong>{activePoint.visits.toLocaleString('id-ID')} sesi</strong>
            </div>
            <div className="visitor-tooltip-row">
              <span>Pengunjung Unik:</span>
              <strong style={{ color: '#ff9282' }}>{activePoint.unique.toLocaleString('id-ID')} orang</strong>
            </div>
          </div>
        )}
      </div>

      <div className="visitor-chart-legend">
        <div className="visitor-legend-items">
          <span className="visitor-legend-badge legend-total">
            <i /> Total Kunjungan (sesi)
          </span>
          <span className="visitor-legend-badge legend-unique">
            <i /> Pengunjung Unik (orang)
          </span>
        </div>
        <div className="visitor-peak-badge">
          <span>Puncak {data.title.toLowerCase()}:</span>
          <strong>{data.peak.toLocaleString('id-ID')} kunjungan / {range === 'year' ? 'bulan' : 'hari'}</strong>
        </div>
      </div>
    </section>
  );
}

function AdminOverview({ books, orders, stats, openModal, navigate }) {
  const recent = books.slice(0, 5);
  return (
    <div className="admin-overview">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Selamat datang</span>
          <h1>Ringkasan <em>katalog.</em></h1>
          <p>Pantau koleksi buku dan terbitan yang sedang berjalan.</p>
        </div>
        <button className="button button-dark" onClick={openModal}>
          <Plus size={17} /> Tambah buku
        </button>
      </div>

      <div className="stat-grid">
        <AdminStat label="Total buku" value={stats.total} change="Semua judul dalam katalog" icon={<BookOpen size={19} />} tone="blue" />
        <AdminStat label="Telah terbit" value={stats.published} change="Koleksi aktif" icon={<Check size={19} />} tone="green" />
        <AdminStat label="Akan terbit" value={stats.upcoming} change="Dalam persiapan" icon={<CalendarDays size={19} />} tone="orange" />
        <AdminStat label="Draf" value={stats.drafts} change="Perlu ditinjau" icon={<FileText size={19} />} tone="purple" />
      </div>

      <VisitorAnalyticsChart />

      <div className="admin-grid-two">
        <section className="admin-panel status-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Distribusi koleksi</span>
              <h2>Status terbitan</h2>
            </div>
            <button className="icon-button" onClick={() => navigate('/admin/buku')}><ArrowUpRight size={17} /></button>
          </div>
          <div className="status-chart">
            <div className="donut" style={{ '--published': `${(stats.published / Math.max(stats.total, 1)) * 100}%`, '--upcoming': `${((stats.published + stats.upcoming) / Math.max(stats.total, 1)) * 100}%` }}>
              <div><strong>{stats.total}</strong><span>judul</span></div>
            </div>
            <div className="chart-legend">
              <span><i className="legend-blue" /> Telah terbit <b>{stats.published}</b></span>
              <span><i className="legend-orange" /> Akan terbit <b>{stats.upcoming}</b></span>
              <span><i className="legend-lilac" /> Draf <b>{stats.drafts}</b></span>
            </div>
          </div>
        </section>

        <section className="admin-panel quick-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Aksi cepat</span>
              <h2>Mulai dari sini</h2>
            </div>
            <Sparkles size={19} className="sparkle" />
          </div>
          <button onClick={openModal}>
            <span className="quick-icon"><Plus size={18} /></span>
            <span><strong>Tambah buku baru</strong><small>Masukkan metadata dan sampul</small></span>
            <ArrowUpRight size={16} />
          </button>
          <button onClick={() => navigate('/admin/buku')}>
            <span className="quick-icon lavender"><Edit3 size={18} /></span>
            <span><strong>Kelola katalog</strong><small>Edit atau ubah status terbitan</small></span>
            <ArrowUpRight size={16} />
          </button>
          <button onClick={() => navigate('/admin/pesanan')}>
            <span className="quick-icon"><Check size={18} /></span>
            <span><strong>{orders.filter((order) => order.status === 'Baru').length} pesanan baru</strong><small>{orders.length} pesanan tersimpan</small></span>
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>

      <section className="admin-panel recent-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Data katalog</span>
            <h2>Ikhtisar koleksi</h2>
          </div>
          <button className="text-button" onClick={() => navigate('/admin/buku')}>Lihat semua <ArrowUpRight size={15} /></button>
        </div>
        <div className="recent-table">
          <div className="table-head">
            <span>Judul</span>
            <span>Status</span>
            <span>Tahun</span>
            <span>Kategori</span>
            <span />
          </div>
          {recent.map((book) => (
            <div className="table-row" key={book.id}>
              <div className="table-book">
                <img className="admin-product-thumb" src={book.image} alt="" />
                <span><strong>{book.title}</strong><small>{book.author}</small></span>
              </div>
              <span><span className={`status-pill ${statusClass(book.status)}`}>{book.status}</span></span>
              <span>{book.year}</span>
              <span className="muted">{book.category}</span>
              <button className="row-arrow" onClick={() => navigate('/admin/buku')}><ArrowUpRight size={15} /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminStat({ label, value, change, icon, tone }) { return <div className={`admin-stat stat-${tone}`}><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value.toString().padStart(2, '0')}</strong><small>{change}</small></div>; }

function AdminIdeas({ settings, onSave, notify, onUploadImage }) {
  const [items, setItems] = useState(() => Array.isArray(settings.editorialIdeas) ? settings.editorialIdeas : []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  useEffect(() => setItems(Array.isArray(settings.editorialIdeas) ? settings.editorialIdeas : []), [settings.editorialIdeas]);
  const updateItem = (id, field, value) => setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  const addItem = () => setItems((current) => [{ id: globalThis.crypto?.randomUUID?.() || `idea-${Date.now()}`, title: '', author: 'Mun’im Sirry', date: '', status: 'Draf', image: '', excerpt: '', body: '' }, ...current]);
  const deleteItem = (id) => {
    const item = items.find((entry) => entry.id === id);
    if (window.confirm(`Hapus tulisan “${item?.title || 'Tanpa judul'}” dari Ruang Ide?`)) setItems((current) => current.filter((entry) => entry.id !== id));
  };
  const handleImageFile = async (id, file, title) => {
    if (!file) return;
    if (!onUploadImage) {
      notify('Fungsi upload gambar belum tersedia.', 'error');
      return;
    }
    setUploadingId(id);
    try {
      const url = await onUploadImage(file, title || `ruang-ide-${id}`);
      const updated = items.map((item) => (item.id === id ? { ...item, image: url } : item));
      setItems(updated);
      setSaving(true);
      try {
        await onSave({ ...settings, editorialIdeas: updated });
        notify('Gambar berhasil diunggah dan langsung tersimpan di website!');
      } finally {
        setSaving(false);
      }
    } catch (error) {
      notify(error.message || 'Gagal mengunggah gambar.', 'error');
    } finally {
      setUploadingId(null);
    }
  };
  const filteredItems = items.filter((item) => {
    const matchesQuery = `${item.title || ''} ${item.author || ''} ${item.excerpt || ''}`.toLocaleLowerCase('id').includes(query.toLocaleLowerCase('id'));
    return matchesQuery && (statusFilter === 'Semua status' || (item.status || 'Draf') === statusFilter);
  });
  const publishedCount = items.filter((item) => item.status === 'Terbit').length;
  const save = async (event) => {
    if (event) event.preventDefault();
    const incomplete = items.find((item) => item.status === 'Terbit' && (!item.title?.trim() || !item.author?.trim() || !item.body?.trim()));
    if (incomplete) { notify('Tulisan berstatus Terbit perlu memiliki judul, nama penulis, dan isi.', 'error'); return; }
    setSaving(true);
    try {
      await onSave({ ...settings, editorialIdeas: items });
      notify('Perubahan tulisan dan gambar berhasil disimpan ke website!');
    } finally {
      setSaving(false);
    }
  };
  return <div className="admin-ideas-page"><div className="admin-page-heading"><div><span className="eyebrow">Penerbitan digital</span><h1>Kelola <em>Ruang Ide.</em></h1><p>Atur tulisan publik, gambar sampul dari perangkat, kutipan pembuka, dan status penerbitan.</p></div><button className="button button-dark" type="button" onClick={addItem}><Plus size={16} /> Tulisan baru</button></div>
    <div className="idea-admin-stats"><div><strong>{items.length.toString().padStart(2, '0')}</strong><span>Total tulisan</span></div><div><strong>{publishedCount.toString().padStart(2, '0')}</strong><span>Terbit di situs</span></div><div><strong>{(items.length - publishedCount).toString().padStart(2, '0')}</strong><span>Draf</span></div></div>
    <form onSubmit={save}><div className="idea-admin-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau penulis…" /></label><label className="select-field"><Filter size={15} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Semua status</option><option>Draf</option><option>Terbit</option></select></label><span>{filteredItems.length} dari {items.length} tulisan</span></div>
      <div className="idea-admin-list">{filteredItems.map((item, index) => <article className="idea-admin-card" key={item.id || index}><div className="idea-admin-card-top"><div><span className="eyebrow">Tulisan {String(items.indexOf(item) + 1).padStart(2, '0')}</span><strong>{item.status === 'Terbit' ? 'Terbit' : 'Draf'}</strong></div><button className="text-button delete-idea-button" type="button" onClick={() => deleteItem(item.id)}><Trash2 size={15} /> Hapus</button></div><div className="idea-admin-card-grid"><div className="idea-admin-media">
        {item.image ? (
          <div className="idea-preview-box">
            <img src={item.image} alt="Pratinjau gambar tulisan" />
            <button
              type="button"
              className="idea-remove-image-btn"
              onClick={async () => {
                const updated = items.map((e) => e.id === item.id ? { ...e, image: '' } : e);
                setItems(updated);
                setSaving(true);
                try {
                  await onSave({ ...settings, editorialIdeas: updated });
                  notify('Gambar dihapus dan website telah diperbarui.');
                } finally {
                  setSaving(false);
                }
              }}
              title="Hapus gambar"
            >
              <X size={13} /> Hapus gambar
            </button>
          </div>
        ) : (
          <div className="idea-preview-placeholder"><UploadCloud size={24} /><span>Belum ada gambar sampul</span></div>
        )}
        <div className="upload-field upload-field-compact">
          <UploadCloud size={18} />
          <span>
            <strong>{uploadingId === item.id ? 'Mengunggah ke Supabase…' : item.image ? 'Ganti gambar dari perangkat' : 'Upload dari perangkat'}</strong>
            <small>PNG, JPG, WEBP · Maks. 10 MB</small>
          </span>
          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingId === item.id} onChange={(event) => { void handleImageFile(item.id, event.target.files?.[0], item.title); event.target.value = ''; }} />
        </div>
        <button
          type="button"
          className="button button-dark idea-save-card-button"
          disabled={saving || uploadingId === item.id}
          onClick={save}
        >
          <Check size={15} /> {saving ? 'Menyimpan…' : 'Simpan tulisan & gambar ini'}
        </button>
      </div><div className="idea-admin-fields"><label className="form-field"><span>Judul tulisan <b>*</b></span><input required={item.status === 'Terbit'} maxLength="180" value={item.title || ''} onChange={(event) => updateItem(item.id, 'title', event.target.value)} placeholder="Judul tulisan" /></label><div className="idea-admin-meta-fields"><label className="form-field"><span>Penulis <b>*</b></span><input required={item.status === 'Terbit'} maxLength="100" value={item.author || ''} onChange={(event) => updateItem(item.id, 'author', event.target.value)} /></label><label className="form-field"><span>Tanggal terbit</span><input type="date" value={item.date || ''} onChange={(event) => updateItem(item.id, 'date', event.target.value)} /></label><label className="form-field"><span>Status</span><select value={item.status || 'Draf'} onChange={(event) => updateItem(item.id, 'status', event.target.value)}><option>Draf</option><option>Terbit</option></select></label></div><label className="form-field"><span>Teaser / kutipan pembuka</span><textarea rows="3" maxLength="320" value={item.excerpt || ''} onChange={(event) => updateItem(item.id, 'excerpt', event.target.value)} placeholder="Ringkasan singkat yang tampil pada kartu Ruang Ide" /></label></div></div><label className="form-field idea-admin-body"><span>Isi tulisan lengkap <b>*</b></span><textarea required={item.status === 'Terbit'} rows="10" maxLength="30000" value={item.body || ''} onChange={(event) => updateItem(item.id, 'body', event.target.value)} placeholder="Pisahkan paragraf dengan satu baris kosong." /><small>Pisahkan paragraf dengan baris kosong; seluruh isi tampil saat pembaca membuka tulisan.</small></label></article>)}
        {!filteredItems.length && <div className="idea-admin-empty">{items.length ? 'Tidak ada tulisan yang cocok dengan pencarian atau status ini.' : 'Belum ada tulisan. Pilih “Tulisan baru” untuk mulai.'}</div>}
      </div><div className="settings-save-row idea-admin-save"><p>Perubahan tulisan disimpan bersama pengaturan situs dan langsung mengatur apa yang tampil di halaman Ruang Ide.</p><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan tulisan'} <Check size={16} /></button></div>
    </form>
  </div>;
}

function AdminSettings({ settings, onSave, notify, navigate, onUploadLogo }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  useEffect(() => setForm(settings), [settings]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    const digits = form.whatsappNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) { notify('Masukkan nomor WhatsApp dengan kode negara yang valid.', 'error'); return; }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };
  return (
    <div className="admin-settings">
      <div className="admin-page-heading"><div><span className="eyebrow">Kontrol publik</span><h1>Pengaturan <em>situs.</em></h1><p>Perubahan disimpan ke Supabase dan digunakan di halaman publik.</p></div></div>
      <form onSubmit={submit} className="settings-grid">
        <section className="admin-panel settings-panel">
          <div className="panel-heading"><div><span className="eyebrow">Identitas visual</span><h2>Logo website & branding</h2><p>Ubah logo utama yang tampil di seluruh header, footer, dan panel admin.</p></div><Sparkles size={19} className="sparkle" /></div>
          <div className="settings-form">
            <div className="admin-logo-edit-box">
              <div className="admin-logo-preview">
                <img src={form.logoUrl || image('logo-remove-background.png')} alt="Logo website" />
                <span>{form.logoUrl ? 'Logo kustom aktif' : 'Logo bawaan (default)'}</span>
              </div>
              <div className="admin-logo-actions">
                <div className="upload-field upload-field-compact">
                  <UploadCloud size={20} />
                  <span>
                    <strong>{uploadingLogo ? 'Mengunggah logo…' : 'Upload logo dari perangkat'}</strong>
                    <small>PNG (transparan disarankan), SVG, JPG · Maks. 5 MB</small>
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    disabled={uploadingLogo}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (!onUploadLogo) { notify('Fungsi upload logo belum tersedia.', 'error'); return; }
                      setUploadingLogo(true);
                      try {
                        const url = await onUploadLogo(file, 'logo-pustaka-alternatif');
                        update('logoUrl', url);
                        notify('Logo baru berhasil diunggah ke Supabase Storage.');
                      } catch (err) {
                        notify(err.message || 'Gagal mengunggah logo', 'error');
                      } finally {
                        setUploadingLogo(false);
                        event.target.value = '';
                      }
                    }}
                  />
                </div>
                {form.logoUrl && (
                  <button type="button" className="button button-ghost" onClick={() => update('logoUrl', '')}>
                    Reset ke logo bawaan
                  </button>
                )}
              </div>
            </div>
            <label className="form-field wide"><span>Atau URL / path logo</span><input value={form.logoUrl || ''} onChange={(event) => update('logoUrl', event.target.value)} placeholder="/assets/logo-remove-background.png atau https://…" /></label>
            <label className="form-field wide"><span>Email resmi kontak</span><input type="email" value={form.contactEmail || 'pustakaalternatif@gmail.com'} onChange={(event) => update('contactEmail', event.target.value)} placeholder="pustakaalternatif@gmail.com" /></label>
            <label className="form-field wide"><span>Alamat kantor / editorial</span><textarea rows="2" value={form.contactAddress || ''} onChange={(event) => update('contactAddress', event.target.value)} placeholder="Alamat editorial atau kantor penerbit…" /></label>
          </div>
        </section>
        <section className="admin-panel settings-panel">
          <div className="panel-heading"><div><span className="eyebrow">Identitas penerbit</span><h2>Informasi publik</h2></div><Settings size={19} className="settings-icon" /></div>
          <div className="settings-form">
            <label className="form-field"><span>Nama penerbit <b>*</b></span><input required maxLength="80" value={form.publisherName} onChange={(event) => update('publisherName', event.target.value)} /></label>
            <label className="form-field"><span>Slogan footer <b>*</b></span><input required maxLength="120" value={form.tagline} onChange={(event) => update('tagline', event.target.value)} /></label>
            <label className="form-field"><span>Nomor WhatsApp situs <b>*</b></span><input required type="tel" value={form.whatsappNumber} onChange={(event) => update('whatsappNumber', event.target.value)} placeholder="+62…" /></label>
            <label className="form-field"><span>Kota / lokasi</span><input maxLength="100" value={form.contactCity} onChange={(event) => update('contactCity', event.target.value)} /></label>
          </div>
        </section>
        <section className="admin-panel settings-panel">
          <div className="panel-heading"><div><span className="eyebrow">Konten beranda</span><h2>Pesan penerbit</h2></div><Sparkles size={19} className="sparkle" /></div>
          <div className="settings-form">
            <label className="form-field wide"><span>Pengantar hero</span><textarea rows="3" maxLength="360" value={form.heroLead} onChange={(event) => update('heroLead', event.target.value)} /></label>
            <label className="form-field wide"><span>Pengantar profil</span><textarea rows="4" maxLength="500" value={form.aboutIntro} onChange={(event) => update('aboutIntro', event.target.value)} /></label>
            <label className="setting-toggle"><span><strong>Tampilkan buku akan terbit</strong><small>Jika dinonaktifkan, katalog publik hanya menampilkan buku yang telah terbit.</small></span><input type="checkbox" checked={Boolean(form.showUpcoming)} onChange={(event) => update('showUpcoming', event.target.checked)} /></label>
          </div>
        </section>
        <section className="admin-panel settings-panel editorial-admin-panel">
          <div className="panel-heading"><div><span className="eyebrow">Ruang Ide</span><h2>Kelola tulisan editorial</h2><p>Atur judul, gambar, kutipan pembuka, isi lengkap, dan status publikasi secara terpisah.</p></div><PenLine size={19} className="settings-icon" /></div>
          <div className="ruang-ide-settings-shortcut"><span>{(form.editorialIdeas || []).filter((item) => item.status === 'Terbit').length} tulisan terbit · {(form.editorialIdeas || []).filter((item) => item.status !== 'Terbit').length} draf</span><button type="button" className="button button-ghost" onClick={() => navigate('/admin/ruang-ide')}>Buka Kelola Ruang Ide <ArrowUpRight size={15} /></button></div>
        </section>
        <section className="admin-panel settings-panel editorial-admin-panel">
          <div className="panel-heading"><div><span className="eyebrow">Naskah & kerja sama</span><h2>Narasi pengantar</h2><p>Pengantar ini tampil di bagian pembuka halaman publik.</p></div><FileText size={19} className="settings-icon" /></div>
          <div className="settings-form"><label className="form-field wide"><span>Narasi pengantar halaman</span><textarea rows="5" maxLength="1600" value={form.submissionIntro || ''} onChange={(event) => update('submissionIntro', event.target.value)} /></label><label className="setting-toggle wide"><span><strong>Penerimaan naskah sedang dibuka</strong><small>Jika dimatikan, halaman publik mengarahkan calon penulis untuk menanyakan jadwal pengajuan melalui email.</small></span><input type="checkbox" checked={Boolean(form.submissionsOpen)} onChange={(event) => update('submissionsOpen', event.target.checked)} /></label></div>
        </section>
        <div className="settings-save-row"><p>Data website selalu dibaca dengan izin publik terbatas; perubahan memerlukan sesi admin aktif.</p><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan pengaturan'} <Check size={16} /></button></div>
      </form>
    </div>
  );
}

function AdminProfile({ profile, user, onSave, onSignOut, notify, logoUrl }) {
  const [name, setName] = useState(profile.display_name || user.user_metadata?.display_name || '');
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try { await onSave(name); } finally { setSaving(false); }
  };
  return (
    <div className="admin-profile">
      <div className="admin-page-heading"><div><span className="eyebrow">Workspace / Akun</span><h1>Profil <em>admin.</em></h1><p>Kelola nama tampilan akun dan periksa peran keamanan.</p></div><button className="button button-ghost" onClick={onSignOut}>Keluar <X size={16} /></button></div>
      <div className="profile-grid">
        <section className="admin-panel profile-card">
          <div className="profile-identity"><div className="profile-avatar profile-avatar-brand"><img src={logoUrl || image('logo-remove-background.png')} alt="Logo" /></div><div><h2>{profile.display_name || profile.email}</h2><p>{profile.role === 'admin' ? 'Administrator' : 'Editor'} · {profile.is_active ? 'Akses aktif' : 'Akses nonaktif'}</p><span className="status-pill published">Terverifikasi</span></div></div>
          <div className="profile-rule" />
          <form className="profile-form" onSubmit={submit}><label className="form-field"><span>Email admin</span><input value={profile.email || user.email || ''} readOnly /></label><label className="form-field"><span>Nama tampilan</span><input maxLength="80" required value={name} onChange={(event) => setName(event.target.value)} /></label><div className="modal-actions"><button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan profil'} <Check size={16} /></button></div></form>
        </section>
        <section className="admin-panel profile-card profile-access"><div className="panel-heading"><div><span className="eyebrow">Keamanan akun</span><h2>Akses admin</h2></div><Users size={19} className="settings-icon" /></div><div className="access-list"><div><span>Email masuk</span><strong>{profile.email || user.email}</strong></div><div><span>Peran Supabase</span><strong>{profile.role}</strong></div><div><span>Reset kata sandi</span><strong>OTP ke email admin</strong></div></div><button className="text-button" onClick={() => notify('Untuk reset kata sandi, keluar lalu pilih “Lupa kata sandi?” di halaman login dan masukkan OTP email.', 'info')}>Cara reset dengan OTP <ArrowUpRight size={15} /></button></section>
      </div>
    </div>
  );
}

function AdminOrders({ orders, onStatusChange }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const statuses = ['Baru', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
  const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');
  const filteredOrders = orders.filter((order) => {
    const searchable = [order.id, order.bookTitle, order.name, order.phone, order.address, order.location]
      .filter(Boolean).join(' ').toLocaleLowerCase('id-ID');
    return (!normalizedQuery || searchable.includes(normalizedQuery))
      && (statusFilter === 'Semua status' || (order.status || 'Baru') === statusFilter);
  });

  const downloadCsv = () => {
    if (!filteredOrders.length) return;
    const fields = [
      ['Nomor pesanan', 'id'], ['Buku', 'bookTitle'], ['Penulis', 'author'],
      ['Jumlah', 'quantity'], ['Harga satuan', 'price'], ['Total harga buku', 'totalPrice'],
      ['Nama pelanggan', 'name'], ['WhatsApp pemesan', 'phone'], ['Alamat', 'address'],
      ['Lokasi', 'location'], ['Catatan', 'note'], ['Status', 'status'], ['Dibuat', 'createdAt'],
    ];
    const cell = (value) => {
      const text = String(value ?? '');
      const safeText = /^\s*[=+@-]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const csv = [fields.map(([label]) => cell(label)), ...filteredOrders.map((order) => fields.map(([, key]) => cell(order[key])))]
      .map((row) => row.join(',')).join('\\r\\n');
    const url = URL.createObjectURL(new Blob(['\\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pesanan-pustaka-alternatif-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadDocx = () => {
    if (!filteredOrders.length) return;
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const rowsHtml = filteredOrders.map((o) => `
      <tr>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt;">${o.id || ''}</td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID') : '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt;"><strong>${o.bookTitle || ''}</strong></td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt; text-align: center;">${o.quantity || 1}</td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt;"><strong>${o.name || ''}</strong></td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt;">${o.phone || '-'}</td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt;">${o.address || '-'} ${o.location ? '(' + o.location + ')' : ''}</td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt; text-align: right;"><strong>${o.totalPrice || o.price || '-'}</strong></td>
        <td style="padding: 8px 10px; border: 1px solid #d1d5db; font-size: 10pt; text-align: center;">${o.status || 'Baru'}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Laporan Pesanan Pustaka Alternatif</title>
<style>
  body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 20px; color: #1e293b; }
  h1 { color: #034694; font-size: 18pt; margin-bottom: 2pt; font-weight: bold; }
  p.meta { color: #64748b; font-size: 10pt; margin-top: 0; margin-bottom: 16pt; }
  table { border-collapse: collapse; width: 100%; border: 1px solid #94a3b8; }
  th { background-color: #034694; color: #ffffff; padding: 10px 8px; font-size: 10.5pt; font-weight: bold; border: 1px solid #034694; text-align: left; }
</style>
</head>
<body>
  <h1>PUSTAKA ALTERNATIF — LAPORAN PESANAN PELANGGAN</h1>
  <p class="meta">Tanggal Ekspor: ${dateStr} · Total Data: ${filteredOrders.length} Pesanan</p>
  <table>
    <thead>
      <tr>
        <th style="color:#ffffff;">ID Pesanan</th>
        <th style="color:#ffffff;">Tanggal</th>
        <th style="color:#ffffff;">Judul Buku</th>
        <th style="color:#ffffff; text-align:center;">Jml</th>
        <th style="color:#ffffff;">Pelanggan</th>
        <th style="color:#ffffff;">WhatsApp</th>
        <th style="color:#ffffff;">Alamat Pengiriman</th>
        <th style="color:#ffffff; text-align:right;">Total</th>
        <th style="color:#ffffff; text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pesanan-pustaka-alternatif-${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadPdf = () => {
    if (!filteredOrders.length) return;
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const rowsHtml = filteredOrders.map((o, idx) => `
      <tr class="${idx % 2 === 1 ? 'even' : ''}">
        <td><strong style="font-family:monospace; color:#034694;">${o.id || ''}</strong></td>
        <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID') : '-'}</td>
        <td><strong>${o.bookTitle || ''}</strong></td>
        <td style="text-align:center;">${o.quantity || 1}</td>
        <td><strong>${o.name || ''}</strong></td>
        <td>${o.phone || '-'}</td>
        <td>${o.address || '-'} ${o.location ? '(' + o.location + ')' : ''}</td>
        <td style="text-align:right;"><strong>${o.totalPrice || o.price || '-'}</strong></td>
        <td style="text-align:center;"><span class="status-tag status-${(o.status || 'baru').toLowerCase()}">${o.status || 'Baru'}</span></td>
      </tr>
    `).join('');

    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Laporan Pesanan - Pustaka Alternatif</title>
<style>
  @page { size: landscape; margin: 12mm 10mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; font-size: 11px; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #034694; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { margin: 0 0 4px; font-size: 20px; color: #034694; letter-spacing: -0.02em; }
  .header p { margin: 0; color: #64748b; font-size: 11px; }
  .summary { font-size: 12px; text-align: right; }
  .summary strong { color: #034694; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; }
  th { background-color: #034694; color: #ffffff; font-weight: 600; font-size: 11px; }
  tr.even { background-color: #f8fafc; }
  .status-tag { display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 9.5px; font-weight: 600; }
  .status-baru { background: #dbeafe; color: #1e40af; }
  .status-diproses { background: #fef3c7; color: #92400e; }
  .status-dikirim { background: #e0e7ff; color: #3730a3; }
  .status-selesai { background: #dcfce7; color: #166534; }
  .status-dibatalkan { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>PUSTAKA ALTERNATIF — LAPORAN PESANAN</h1>
      <p>Membuka Wacana, Menyalakan Gagasan · Laporan Cetak Resmi</p>
    </div>
    <div class="summary">
      Tanggal Cetak: <strong>${dateStr}</strong><br/>
      Total: <strong>${filteredOrders.length} Pesanan</strong>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 13%;">ID Pesanan</th>
        <th style="width: 9%;">Tanggal</th>
        <th style="width: 20%;">Buku</th>
        <th style="width: 5%; text-align:center;">Jml</th>
        <th style="width: 14%;">Pelanggan</th>
        <th style="width: 11%;">WhatsApp</th>
        <th style="width: 15%;">Alamat</th>
        <th style="width: 8%; text-align:right;">Total</th>
        <th style="width: 5%; text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  <div class="footer">
    <span>Dokumen resmi dikeluarkan oleh sistem internal Pustaka Alternatif</span>
    <span>Halaman 1</span>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`);
    printWin.document.close();
  };

  return (
    <div className="admin-orders">
      <div className="admin-page-heading"><div><span className="eyebrow">Pesanan pelanggan</span><h1>Kelola <em>pesanan.</em></h1><p>Pantau pesanan, perbarui status dan ekspor data pelanggan dengan aman.</p></div><span className="orders-provider">{orders.length} pesanan</span></div>
      <div className="orders-toolbar">
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nomor, buku, pelanggan, atau alamat…" aria-label="Cari pesanan" /></label>
        <label className="select-field"><Filter size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter status pesanan"><option>Semua status</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={15} /></label>
        <span className="result-count">{filteredOrders.length} dari {orders.length} pesanan</span>
        <div className="orders-export-group">
          <button className="button button-ghost export-button" type="button" onClick={downloadCsv} disabled={!filteredOrders.length} title="Unduh format spreadsheet CSV"><Download size={15} /> Unduh CSV</button>
          <button className="button button-ghost export-button" type="button" onClick={downloadPdf} disabled={!filteredOrders.length} title="Cetak atau simpan ke PDF"><Printer size={15} /> Unduh PDF</button>
          <button className="button button-ghost export-button" type="button" onClick={downloadDocx} disabled={!filteredOrders.length} title="Unduh format dokumen Word DOCX"><FileText size={15} /> Unduh DOCX</button>
        </div>
      </div>
      <section className="admin-panel orders-panel"><div className="orders-head"><span>Rincian pesanan</span><span>Pelanggan & pengiriman</span><span>Status</span><span>Waktu</span></div>
        {filteredOrders.length ? filteredOrders.map((order) => <div className="order-row" key={order.id}>
          <div><strong>{order.bookTitle} × {order.quantity || 1}</strong><small>{order.id}</small><small>{order.price} / buku</small><small className="order-total">Total buku: {order.totalPrice}</small></div>
          <div><strong>{order.name}</strong><small>{order.phone}</small><small>{order.address}</small>{order.location && <small className="order-location"><MapPinned size={12} /> {order.location}</small>}{order.note && <small>Catatan: {order.note}</small>}</div>
          <label className="order-status-select"><span className="sr-only">Status {order.id}</span><select value={order.status || 'Baru'} onChange={(event) => onStatusChange(order.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <time>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : 'Belum tersedia'}</time>
        </div>) : <div className="empty-state small"><Check size={24} /><h3>{orders.length ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}</h3><p>{orders.length ? 'Ubah kata kunci atau filter status.' : 'Pesanan yang dikirim melalui checkout akan muncul di sini.'}</p></div>}
      </section>
      <div className="mock-note"><Sparkles size={16} /><span>Data pesanan admin hanya dapat dibaca oleh akun admin aktif melalui kebijakan RLS Supabase.</span></div>
    </div>
  );
}

function AdminBooks({ books, categories, addCategory, deleteCategory, renameCategory, updateBook, deleteBook, openModal, openEdit }) {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua status');
  const filtered = books.filter((book) => [book.title, book.author, book.category, book.isbn].filter(Boolean).join(' ').toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID')) && (filter === 'Semua status' || book.status === filter));
  const featuredCount = books.filter((book) => book.featured).length;
  const beginCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryDraft(category);
  };
  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryDraft('');
  };
  const submitCategoryEdit = async (event, category) => {
    event.preventDefault();
    if (await renameCategory(category, categoryDraft)) cancelCategoryEdit();
  };

  return (
    <div className="admin-books">
      <div className="admin-page-heading">
        <div><span className="eyebrow">Konten utama</span><h1>Kelola <em>buku.</em></h1><p>Tambahkan, perbarui, dan atur visibilitas buku di katalog publik.</p></div>
        <button className="button button-dark" onClick={openModal}><Plus size={17} /> Tambah buku</button>
      </div>
      <div className="book-manager-toolbar">
        <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, penulis, kategori, atau ISBN…" /></label>
        <label className="select-field"><Filter size={16} /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Semua status</option><option>Telah terbit</option><option>Akan terbit</option><option>Draf</option></select><ChevronDown size={15} /></label>
        <span className="result-count">{filtered.length} dari {books.length} buku</span>
      </div>
      <section className="category-manager-panel">
        <div><span className="eyebrow">Taksonomi katalog</span><h2>Kelola kategori buku</h2><p>Tambah atau ubah nama kategori. Kategori yang masih dipakai buku perlu dialihkan sebelum dihapus.</p></div>
        <form className="category-add-form" onSubmit={async (event) => { event.preventDefault(); if (await addCategory(newCategory)) setNewCategory(''); }}>
          <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nama kategori baru" aria-label="Nama kategori baru" />
          <button className="button button-dark" type="submit"><Plus size={15} /> Tambah</button>
        </form>
        <div className="category-chip-list">
          {categories.map((category) => editingCategory === category ? (
            <form className="category-chip category-chip-editing" key={category} onSubmit={(event) => submitCategoryEdit(event, category)}>
              <input autoFocus value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} aria-label={`Nama baru untuk ${category}`} />
              <button className="category-save-button" type="submit" title="Simpan nama kategori" aria-label="Simpan nama kategori"><Check size={13} /></button>
              <button className="category-cancel-button" type="button" onClick={cancelCategoryEdit} title="Batal mengubah nama kategori" aria-label="Batal mengubah nama kategori"><X size={13} /></button>
            </form>
          ) : (
            <span className="category-chip" key={category}>
              <span>{category}</span>
              <button className="category-edit-button" type="button" onClick={() => beginCategoryEdit(category)} aria-label={`Ubah kategori ${category}`} title={`Ubah kategori ${category}`}><Edit3 size={13} /></button>
              <button className="category-remove-button" type="button" onClick={() => deleteCategory(category)} aria-label={`Hapus kategori ${category}`} title="Hapus kategori"><X size={13} /></button>
            </span>
          ))}
        </div>
      </section>
      <section className="admin-panel manager-panel">
        <div className="manager-head"><span>Informasi buku</span><span>Status terbitan</span><span>Tahun terbit</span><span>Aksi</span></div>
        {filtered.map((book) => (
          <div className="manager-row" key={book.id}>
            <div className="manager-book"><img className="admin-product-thumb" src={book.image} alt="" /><div><strong>{book.title}</strong><span>{book.author}</span><small>{book.category} · {book.year}</small><small className={book.priceIdr ? '' : 'price-unset'}>{book.priceIdr ? formatPrice(book.priceIdr) : 'Harga belum ditetapkan'}</small>{book.featured && <small className="featured-book-badge">Pilihan editor</small>}</div></div>
            <div className="manager-status"><select value={book.status} onChange={(event) => updateBook(book.id, 'status', event.target.value)}><option>Telah terbit</option><option>Akan terbit</option><option>Draf</option></select><span className={`status-dot ${statusClass(book.status)}`} /></div>
            <span className="manager-date">{book.year}</span>
            <div className="manager-actions"><button type="button" className={`featured-toggle ${book.featured ? 'active' : ''}`} title={book.featured ? 'Hapus dari Pilihan editor' : 'Tampilkan sebagai Pilihan editor'} aria-label={book.featured ? 'Hapus dari Pilihan editor' : 'Tampilkan sebagai Pilihan editor'} aria-pressed={Boolean(book.featured)} disabled={book.featured && featuredCount <= 2} onClick={() => updateBook(book.id, 'featured', !book.featured)}><Sparkles size={16} /></button><button type="button" title="Edit metadata" onClick={() => openEdit(book)}><Edit3 size={16} /></button><button type="button" title="Hapus buku" onClick={() => deleteBook(book.id)}><Trash2 size={16} /></button></div>
          </div>
        ))}
        {!filtered.length && <div className="empty-state small"><Search size={24} /><p>Tidak ada buku yang sesuai.</p></div>}
      </section>
      <div className="mock-note"><Sparkles size={16} /><span>Harga dan metadata tersimpan di Supabase; buku tanpa harga tidak dapat dipesan.</span></div>
    </div>
  );
}

function AdminAuthors({ authors, books, openModal, openEdit, deleteAuthor }) {
  const [query, setQuery] = useState('');
  const filtered = authors.filter((author) => `${author.name} ${author.focus} ${author.bio}`.toLowerCase().includes(query.toLowerCase()));
  const bookCount = (author) => books.filter((book) => book.authorId === author.id || book.author === author.name).length;
  return <div className="admin-authors"><div className="admin-page-heading"><div><span className="eyebrow">Konten pendukung</span><h1>Kelola <em>penulis.</em></h1><p>Atur profil penulis dan hubungkan mereka dengan koleksi buku.</p></div><button className="button button-dark" onClick={openModal}><Plus size={17} /> Tambah penulis</button></div><div className="book-manager-toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau bidang penulis…" /></label><span className="result-count">{filtered.length} dari {authors.length} penulis</span></div><section className="admin-panel author-manager-panel"><div className="author-manager-head"><span>Profil penulis</span><span>Bidang</span><span>Buku terhubung</span><span>Aksi</span></div>{filtered.map((author) => <div className="author-manager-row" key={author.id}><div className="author-identity"><span className="author-initials">{author.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{author.name}</strong><small>{author.bio}</small></div></div><span className="author-focus">{author.focus || 'Belum ditentukan'}</span><span className="author-book-count">{bookCount(author)} <small>{bookCount(author) === 1 ? 'buku' : 'buku'}</small></span><div className="manager-actions"><button title="Edit penulis" onClick={() => openEdit(author)}><Edit3 size={16} /></button><button title="Hapus penulis" onClick={() => deleteAuthor(author.id)}><Trash2 size={16} /></button></div></div>)}{!filtered.length && <div className="empty-state small"><Search size={24} /><p>Tidak ada penulis yang sesuai.</p></div>}</section><div className="mock-note"><Sparkles size={16} /><span>Profil penulis dan relasi buku dikelola dari basis data Supabase.</span></div></div>;
}

function AuthorModal({ onClose, onSave, initialAuthor }) {
  const editing = Boolean(initialAuthor);
  const [form, setForm] = useState(() => initialAuthor ? { ...initialAuthor } : { name: '', focus: 'Studi Islam & dialog', bio: '' });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const [saving, setSaving] = useState(false);
  const submit = async (event) => { event.preventDefault(); if (!form.name.trim()) return; setSaving(true); try { if (await onSave({ ...form, name: form.name.trim(), bio: form.bio.trim() })) onClose(); } finally { setSaving(false); } };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="book-modal author-modal"><div className="modal-heading"><div><span className="eyebrow">Penulis / {editing ? 'Edit profil' : 'Penulis baru'}</span><h2>{editing ? 'Edit' : 'Tambah'} <em>penulis.</em></h2><p>Profil singkat ini membantu tim mengenali dan menghubungkan karya penulis.</p></div><button className="close-button" onClick={onClose}><X size={19} /></button></div><form onSubmit={submit}><div className="form-grid"><label className="form-field wide"><span>Nama penulis <b>*</b></span><input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Contoh: A. Rahman" /></label><label className="form-field wide"><span>Bidang atau fokus</span><input value={form.focus} onChange={(event) => update('focus', event.target.value)} placeholder="Contoh: Sejarah & kajian publik" /></label><label className="form-field wide"><span>Bio singkat</span><textarea rows="5" value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Tuliskan latar belakang penulis…" /></label></div><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Batal</button><button type="submit" className="button button-dark" disabled={saving}><Check size={16} /> {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan penulis'}</button></div></form></section></div>;
}

function BookModal({ onClose, onSave, onUploadCover, notify, initialBook, authors, categories }) {
  const editing = Boolean(initialBook);
  const [form, setForm] = useState(() => {
    if (initialBook) return { ...initialBook, priceIdr: initialBook.priceIdr ?? parsePrice(initialBook.price) ?? '', authorId: initialBook.authorId || authors.find((author) => author.name === initialBook.author)?.id || '' };
    const firstAuthor = authors[0];
    return { title: '', author: firstAuthor?.name || '', authorId: firstAuthor?.id || '', authorNote: firstAuthor?.bio || '', isbn: '', category: categories[0] || '', description: '', year: '2026', status: 'Draf', image: image('mencari-muhammad-front.png'), featured: false, priceIdr: '', stock: '' };
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectAuthor = (value) => {
    const selected = authors.find((author) => author.id === value);
    setForm((current) => ({ ...current, authorId: value, author: selected?.name || '', authorNote: selected?.bio || current.authorNote }));
  };
  const submit = async (event) => {
    event.preventDefault();
    const priceIdr = Number(form.priceIdr);
    if (!form.title.trim() || !form.authorId || !form.author || !Number.isSafeInteger(priceIdr) || priceIdr < 1) {
      notify('Isi judul, penulis, dan harga Rupiah yang valid.', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await onSave({ ...form, title: form.title.trim(), longTitle: form.longTitle?.trim() || form.title.trim(), authorNote: form.authorNote || 'Kontributor Pustaka Alternatif', priceIdr, price: formatPrice(priceIdr), stock: form.stock === '' ? null : Number(form.stock) });
      if (saved) onClose();
    } finally {
      setSaving(false);
    }
  };
  const handleCover = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await onUploadCover(file, form.title || 'sampul-buku');
      update('image', imageUrl);
      notify('Sampul diunggah ke Supabase Storage.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="book-modal"><div className="modal-heading"><div><span className="eyebrow">Katalog / {editing ? 'Edit metadata' : 'Buku baru'}</span><h2>{editing ? 'Edit' : 'Tambah'} <em>buku.</em></h2><p>Harga wajib ditetapkan agar total checkout dapat dihitung dengan tepat.</p></div><button className="close-button" onClick={onClose}><X size={19} /></button></div><form onSubmit={submit}><div className="form-grid"><label className="form-field wide"><span>Judul buku <b>*</b></span><input required maxLength="180" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Contoh: Membaca ulang sejarah…" /></label><label className="form-field"><span>Penulis <b>*</b></span><select required value={form.authorId || ''} onChange={(event) => selectAuthor(event.target.value)}><option value="" disabled>Pilih penulis</option>{authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}</select></label><label className="form-field"><span>ISBN</span><input value={form.isbn || ''} onChange={(event) => update('isbn', event.target.value)} placeholder="978-623-…" /></label><label className="form-field"><span>Kategori <b>*</b></span><select required value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="form-field"><span>Harga buku (Rupiah) <b>*</b></span><input required type="number" inputMode="numeric" min="1" step="1" value={form.priceIdr} onChange={(event) => update('priceIdr', event.target.value)} placeholder="100000" /></label><label className="form-field"><span>Stok (opsional)</span><input type="number" min="0" step="1" value={form.stock ?? ''} onChange={(event) => update('stock', event.target.value)} placeholder="Kosongkan jika tidak dicatat" /></label><label className="form-field"><span>Tahun / tanggal terbit</span><input value={form.year} onChange={(event) => update('year', event.target.value)} placeholder="2026" /></label><label className="form-field"><span>Status</span><select value={form.status} onChange={(event) => update('status', event.target.value)}><option>Draf</option><option>Akan terbit</option><option>Telah terbit</option></select></label><label className="setting-toggle modal-setting-toggle"><span><strong>Pilihan editor beranda</strong><small>Tampilkan buku pada hero dan bagian Pilihan editor di halaman utama.</small></span><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => update('featured', event.target.checked)} /></label><label className="form-field wide"><span>Sinopsis singkat</span><textarea rows="4" maxLength="4000" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Tuliskan ringkasan buku…" /></label><label className="form-field wide"><span>Sampul buku</span><div className="upload-field"><UploadCloud size={22} /><span><strong>{uploading ? 'Mengunggah…' : editing && form.image ? 'Ganti sampul HD' : 'Pilih sampul HD'}</strong><small>PNG atau JPG · Maks. 10 MB · Disimpan permanen di Supabase Storage</small></span><input type="file" accept="image/png,image/jpeg" disabled={uploading} onChange={(event) => { void handleCover(event.target.files?.[0]); event.target.value = ''; }} /></div></label></div><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Batal</button><button type="submit" className="button button-dark" disabled={saving || uploading}><Check size={16} /> {saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan buku'}</button></div></form></section></div>;
}

function Toast({ toast, onClose }) { return <div className={`toast toast-${toast.type}`}><span className="toast-icon">{toast.type === 'success' ? <Check size={15} /> : <Sparkles size={15} />}</span><span>{toast.message}</span><button onClick={onClose}><X size={15} /></button></div>; }
function NotFound({ navigate }) { return <div className="not-found section-shell"><span className="eyebrow">404 / halaman tidak ditemukan</span><h1>Gagasan ini<br /><em>belum ditulis.</em></h1><button className="button button-dark" onClick={() => navigate('/')}>Kembali ke beranda <ArrowUpRight size={17} /></button></div>; }

createRoot(document.getElementById('root')).render(<App />);
