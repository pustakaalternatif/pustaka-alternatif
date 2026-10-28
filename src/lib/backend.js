import { createClient } from '@supabase/supabase-js';
import { DEFAULT_EDITORIAL_IDEAS } from './editorialIdeas.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        flowType: 'pkce',
      },
    })
  : null;

export const hasSupabaseConfig = Boolean(supabaseClient);

const ORDER_STORAGE_KEY = 'ruangbaca.orders.v2';
const SETTINGS_STORAGE_KEY = 'ruangbaca.settings.v1';

export const defaultSiteSettings = {
  publisherName: 'Pustaka Alternatif',
  tagline: 'Membuka Wacana, Menyalakan Gagasan',
  whatsappNumber: '+6287865997529',
  contactCity: 'Yogyakarta · Indonesia',
  heroLead: 'PUSTAKA ALTERNATIF menghadirkan karya yang mengajak kita membaca dengan saksama, mempertanyakan anggapan yang mapan, dan memahami kehidupan dari berbagai sudut pandang. Sebagai sebuah ikhtiar keilmuan yang serius, penerbit kami dimaksudkan untuk memperkaya wacana publik serta turut membentuk materi pendidikan dan kebijakan publik. Kami juga berupaya menjadikan hasil kajian ilmiah sebagai sarana pendidikan masyarakat dalam arti luas.',
  aboutIntro: 'PUSTAKA ALTERNATIF adalah penerbit yang berorientasi pada pendidikan publik. Kami menghadirkan buku untuk memperluas akses pembaca Indonesia terhadap kajian ilmiah, pemikiran kritis, dan karya yang membuka ruang percakapan. Melalui karya asli dan terjemahan, kami ingin mempertemukan pembaca dengan gagasan yang membantu memahami agama, sejarah, kebudayaan, dan kehidupan sosial secara lebih mendalam.',
  showUpcoming: true,
  editorialIdeas: DEFAULT_EDITORIAL_IDEAS,
  submissionIntro: 'PUSTAKA ALTERNATIF menyambut percakapan dengan penulis, penerjemah, pemegang hak, toko buku, dan komunitas literasi. Kami tertarik pada kerja sama yang memperluas akses terhadap bacaan bermutu dan mendukung pendidikan publik.',
  submissionsOpen: false,
  logoUrl: '',
  contactEmail: 'pustakaalternatif@gmail.com',
  contactAddress: '',
};

const assertNoError = (error) => {
  if (error) throw new Error(error.message || 'Operasi Supabase gagal.');
};

const currency = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number(value));

export const parseRupiah = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const digits = String(value).replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};

const mapBook = (row) => {
  const priceIdr = row.price_idr === null || row.price_idr === undefined ? null : Number(row.price_idr);
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    longTitle: row.long_title || row.title,
    author: row.author_name,
    authorId: row.author_id || '',
    authorNote: row.author_note || '',
    year: row.year || '',
    category: row.category || '',
    status: row.status || 'Draf',
    isbn: row.isbn || '',
    priceIdr,
    price: priceIdr ? currency(priceIdr) : null,
    image: row.image_url || '/assets/mencari-muhammad-front.png',
    backImage: row.back_image_url || '',
    color: row.color || 'blue',
    description: row.description || '',
    featured: Boolean(row.featured),
    stock: row.stock === null || row.stock === undefined ? null : Number(row.stock),
  };
};

const toBookRow = (book) => {
  const row = {
    slug: book.slug,
    title: book.title.trim(),
    long_title: book.longTitle?.trim() || book.title.trim(),
    author_id: book.authorId || null,
    author_name: book.author.trim(),
    author_note: book.authorNote || '',
    year: String(book.year || ''),
    category: book.category,
    status: book.status,
    isbn: book.isbn || null,
    price_idr: book.priceIdr === '' || book.priceIdr === undefined || book.priceIdr === null
      ? parseRupiah(book.price)
      : Number(book.priceIdr),
    image_url: book.image,
    back_image_url: book.backImage || null,
    color: book.color || 'blue',
    description: book.description || '',
    featured: Boolean(book.featured),
    stock: book.stock === '' || book.stock === undefined ? null : (book.stock === null ? null : Number(book.stock)),
  };
  const id = Number(book.id);
  if (Number.isSafeInteger(id) && id > 0) row.id = id;
  return row;
};

const mapAuthor = (row) => ({
  id: row.id,
  name: row.name,
  bio: row.bio || '',
  focus: row.focus || '',
});

const toAuthorRow = (author) => ({
  id: author.id || `author-${crypto.randomUUID()}`,
  name: author.name.trim(),
  bio: author.bio?.trim() || '',
  focus: author.focus?.trim() || '',
});

const mapSettings = (row) => ({
  ...defaultSiteSettings,
  publisherName: row.publisher_name || defaultSiteSettings.publisherName,
  tagline: row.tagline || defaultSiteSettings.tagline,
  whatsappNumber: row.whatsapp_phone || defaultSiteSettings.whatsappNumber,
  contactCity: row.contact_city || defaultSiteSettings.contactCity,
  heroLead: row.hero_lead || defaultSiteSettings.heroLead,
  aboutIntro: row.about_intro || defaultSiteSettings.aboutIntro,
  showUpcoming: row.show_upcoming ?? defaultSiteSettings.showUpcoming,
  editorialIdeas: Array.isArray(row.editorial_content?.editorialIdeas)
    && (row.editorial_content.editorialIdeas.length > 0 || row.editorial_content?.editorialSeedVersion)
    ? row.editorial_content.editorialIdeas
    : defaultSiteSettings.editorialIdeas,
  submissionIntro: row.editorial_content?.submissionIntro || defaultSiteSettings.submissionIntro,
  submissionsOpen: row.editorial_content?.submissionsOpen ?? defaultSiteSettings.submissionsOpen,
  logoUrl: row.editorial_content?.logoUrl || defaultSiteSettings.logoUrl,
  contactEmail: row.editorial_content?.contactEmail || defaultSiteSettings.contactEmail,
  contactAddress: row.editorial_content?.contactAddress || defaultSiteSettings.contactAddress,
});

const toSettingsRow = (settings) => ({
  id: 'main',
  publisher_name: settings.publisherName.trim(),
  tagline: settings.tagline.trim(),
  whatsapp_phone: settings.whatsappNumber.trim(),
  contact_city: settings.contactCity.trim(),
  hero_lead: settings.heroLead.trim(),
  about_intro: settings.aboutIntro.trim(),
  show_upcoming: Boolean(settings.showUpcoming),
  editorial_content: {
    editorialIdeas: Array.isArray(settings.editorialIdeas) ? settings.editorialIdeas : [],
    editorialSeedVersion: '20261027-ruang-ide',
    submissionIntro: String(settings.submissionIntro || defaultSiteSettings.submissionIntro).trim(),
    submissionsOpen: Boolean(settings.submissionsOpen),
    logoUrl: String(settings.logoUrl || '').trim(),
    contactEmail: String(settings.contactEmail || defaultSiteSettings.contactEmail).trim(),
    contactAddress: String(settings.contactAddress || '').trim(),
  },
});

const mapOrder = (row) => {
  const unitPriceIdr = Number(row.unit_price_idr ?? row.price_idr ?? parseRupiah(row.price)) || null;
  const totalPriceIdr = Number(row.total_price_idr ?? parseRupiah(row.total_price)) || null;
  return {
    id: row.id,
    bookId: row.book_id,
    bookSlug: row.book_slug,
    bookTitle: row.book_title,
    author: row.book_author || '',
    priceIdr: unitPriceIdr,
    totalPriceIdr,
    price: unitPriceIdr ? currency(unitPriceIdr) : (row.price || ''),
    totalPrice: totalPriceIdr ? currency(totalPriceIdr) : (row.total_price || ''),
    quantity: Number(row.quantity) || 1,
    name: row.name,
    phone: row.phone,
    address: row.address,
    location: row.location || '',
    note: row.note || '',
    status: row.status || 'Baru',
    createdAt: row.created_at || row.createdAt,
  };
};

const localOrders = () => {
  try {
    return JSON.parse(window.localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveLocalOrders = (orders) => {
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
};

export function getOrders() {
  return supabaseClient ? [] : localOrders();
}

export async function loadSiteData(fallback) {
  if (!supabaseClient) {
    let settings = defaultSiteSettings;
    try {
      const saved = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null');
      if (saved) settings = { ...settings, ...saved };
    } catch {
      // Keep the checked-in, public-safe preview defaults.
    }
    return { ...fallback, settings, mode: 'preview' };
  }

  const [booksResult, authorsResult, categoriesResult, settingsResult] = await Promise.all([
    supabaseClient.from('books').select('*').order('id'),
    supabaseClient.from('authors').select('*').order('name'),
    supabaseClient.from('categories').select('name').order('name'),
    supabaseClient.from('site_settings').select('*').eq('id', 'main').maybeSingle(),
  ]);
  assertNoError(booksResult.error);
  assertNoError(authorsResult.error);
  assertNoError(categoriesResult.error);
  assertNoError(settingsResult.error);
  return {
    books: (booksResult.data || []).map(mapBook),
    authors: (authorsResult.data || []).map(mapAuthor),
    categories: (categoriesResult.data || []).map((row) => row.name),
    settings: settingsResult.data ? mapSettings(settingsResult.data) : defaultSiteSettings,
    mode: 'supabase',
  };
}

export async function loadAdminProfile(userId) {
  if (!supabaseClient || !userId) return null;
  const { data, error } = await supabaseClient
    .from('admin_users')
    .select('user_id,email,display_name,role,is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  assertNoError(error);
  if (!data) return null;
  const { data: authData } = await supabaseClient.auth.getUser();
  const displayName = authData.user?.id === userId ? authData.user.user_metadata?.display_name : '';
  return { ...data, display_name: displayName || data.display_name };
}

export async function signInAdmin(email, password) {
  if (!supabaseClient) throw new Error('Supabase belum dikonfigurasi. Ikuti panduan deployment untuk mengaktifkan login admin.');
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: email.trim(), password });
  assertNoError(error);
  const profile = await loadAdminProfile(data.user.id);
  if (!profile) {
    await supabaseClient.auth.signOut();
    throw new Error('Akun ini belum terdaftar sebagai admin aktif. Hubungi pemilik situs.');
  }
  return { user: data.user, profile };
}

export async function requestPasswordRecoveryOtp(email) {
  if (!supabaseClient) throw new Error('Pemulihan kata sandi baru aktif setelah Supabase dikonfigurasi.');
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim());
  assertNoError(error);
}

export async function verifyRecoveryOtpAndSetPassword({ email, otp, password }) {
  if (!supabaseClient) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabaseClient.auth.verifyOtp({
    email: email.trim(),
    token: otp.trim(),
    type: 'recovery',
  });
  assertNoError(error);
  const { error: updateError } = await supabaseClient.auth.updateUser({ password });
  assertNoError(updateError);
  const user = data.user || (await supabaseClient.auth.getUser()).data.user;
  const profile = await loadAdminProfile(user?.id);
  if (!profile) {
    await supabaseClient.auth.signOut();
    throw new Error('Akun ini bukan admin aktif. Kata sandi diperbarui, tetapi akses panel ditolak.');
  }
  return { user, profile };
}

export async function signOutAdmin() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  assertNoError(error);
}

export function listenToAuthChanges(callback) {
  if (!supabaseClient) return () => {};
  const { data } = supabaseClient.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

export async function updateAdminDisplayName(displayName) {
  if (!supabaseClient) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabaseClient.auth.updateUser({ data: { display_name: displayName.trim() } });
  assertNoError(error);
  return data.user;
}

export async function changeAdminPassword(password) {
  if (!supabaseClient) throw new Error('Supabase belum dikonfigurasi.');
  const { error } = await supabaseClient.auth.updateUser({ password });
  assertNoError(error);
}

export async function loadOrders() {
  if (!supabaseClient) return localOrders();
  const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  assertNoError(error);
  return (data || []).map(mapOrder);
}

export async function createOrder(order) {
  const quantity = Number(order.quantity);
  const priceIdr = Number(order.priceIdr ?? order.unitPriceIdr ?? 0);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Jumlah buku harus antara 1 dan 99.');
  if (!Number.isSafeInteger(priceIdr) || priceIdr < 1) throw new Error('Harga buku belum ditetapkan oleh admin.');
  const totalPriceIdr = priceIdr * quantity;
  if (!Number.isSafeInteger(totalPriceIdr)) throw new Error('Total harga terlalu besar.');
  const id = `ord_${globalThis.crypto?.randomUUID?.() || Date.now()}`;
  const createdAt = new Date().toISOString();
  const record = {
    id,
    bookId: Number(order.bookId),
    bookSlug: order.bookSlug,
    bookTitle: order.bookTitle,
    author: order.author,
    quantity,
    priceIdr,
    totalPriceIdr,
    price: currency(priceIdr),
    totalPrice: currency(totalPriceIdr),
    name: order.name.trim(),
    phone: order.phone.trim(),
    address: order.address.trim(),
    location: order.location.trim(),
    note: order.note?.trim() || '',
    status: 'Baru',
    createdAt,
  };

  if (supabaseClient) {
    const payload = {
      id: record.id,
      book_id: record.bookId,
      book_slug: record.bookSlug,
      book_title: record.bookTitle,
      book_author: record.author,
      unit_price_idr: priceIdr,
      total_price_idr: totalPriceIdr,
      quantity,
      name: record.name,
      phone: record.phone,
      address: record.address,
      location: record.location,
      note: record.note,
      status: 'Baru',
      created_at: createdAt,
    };
    const { error } = await supabaseClient.from('orders').insert(payload);
    assertNoError(error);
    return record;
  }

  const orders = localOrders();
  saveLocalOrders([record, ...orders]);
  return record;
}

export async function updateOrderStatus(orderId, status) {
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*')
      .single();
    assertNoError(error);
    return mapOrder(data);
  }
  const next = localOrders().map((order) => order.id === orderId ? { ...order, status } : order);
  saveLocalOrders(next);
  return next.find((order) => order.id === orderId) || null;
}

export async function upsertBook(book) {
  if (!supabaseClient) return { ...book, id: book.id || Date.now() };
  const { data, error } = await supabaseClient.from('books').upsert(toBookRow(book)).select('*').single();
  assertNoError(error);
  return mapBook(data);
}

export async function deleteBook(bookId) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from('books').delete().eq('id', bookId);
  assertNoError(error);
}

export async function insertCategory(name) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from('categories').insert({ name: name.trim() });
  assertNoError(error);
}

export async function renameCategory(previousName, nextName) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from('categories').update({ name: nextName.trim() }).eq('name', previousName);
  assertNoError(error);
}

export async function deleteCategory(name) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from('categories').delete().eq('name', name);
  assertNoError(error);
}

export async function upsertAuthor(author) {
  if (!supabaseClient) return { ...author, id: author.id || `author-${Date.now()}` };
  const { data, error } = await supabaseClient.from('authors').upsert(toAuthorRow(author)).select('*').single();
  assertNoError(error);
  return mapAuthor(data);
}

export async function deleteAuthor(authorId) {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.from('authors').delete().eq('id', authorId);
  assertNoError(error);
}

export async function saveSiteSettings(settings) {
  if (!supabaseClient) {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }
  const { data, error } = await supabaseClient.from('site_settings').upsert(toSettingsRow(settings)).select('*').single();
  assertNoError(error);
  return mapSettings(data);
}

export async function uploadBookCover(file, bookTitle) {
  if (!supabaseClient) throw new Error('Upload permanen memerlukan konfigurasi Supabase Storage.');
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    throw new Error('Format gambar harus PNG, JPG, WEBP, atau SVG.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 10 MB.');
  const extension = file.type === 'image/png' ? 'png'
    : file.type === 'image/webp' ? 'webp'
    : file.type === 'image/svg+xml' ? 'svg' : 'jpg';
  const slug = String(bookTitle || 'media').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const path = `${slug || 'media'}/${globalThis.crypto?.randomUUID?.() || Date.now()}.${extension}`;
  const { error } = await supabaseClient.storage.from('book-covers').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  assertNoError(error);
  return supabaseClient.storage.from('book-covers').getPublicUrl(path).data.publicUrl;
}

export const backendConfig = {
  provider: hasSupabaseConfig ? 'supabase-auth-postgres-storage' : 'unconfigured-preview',
  ordersTable: 'orders',
  catalogTables: ['books', 'authors', 'categories'],
};
