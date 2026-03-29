import { useState, useEffect, useRef } from 'react'

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [addedMsg, setAddedMsg] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [searchQuery, setSearchQuery] = useState(''); 

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('s1te_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); 
      tg.setHeaderColor('#ff0000'); 
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('s1te_cart', JSON.stringify(cart));
  }, [cart]);

  const shopRef = useRef(null);
  const sliderRef = useRef(null);
  const allProductsRef = useRef(null);

  useEffect(() => { 
    setIsVisible(true); 
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    setTimeout(() => {
      const productsCards = document.querySelectorAll('.product-scroll-anim');
      productsCards.forEach(card => {
        card.classList.remove('is-visible'); 
        observer.observe(card);
      });
      
      const titles = document.querySelectorAll('.animated-title');
      titles.forEach(title => observer.observe(title));

      if (shopRef.current) observer.observe(shopRef.current);
      if (allProductsRef.current) observer.observe(allProductsRef.current);
    }, 100);

    return () => observer.disconnect();
  }, [selectedCategory, searchQuery]);

  const shoeSizes = ["37", "38", "39", "40", "41", "42", "43", "44", "45"];
  const clothingSizes = ["S", "M", "L", "XL"];

  const [products] = useState([
    { id: 1, name: "Raf simons ozweego 3", price: "3 200", images: ["raf.png"], desc: "Преміальний комфорт та футуристичний силует.", sizes: shoeSizes, category: "Кросівки" },
    { id: 2, name: "Lanvin curb", price: "5700", images: ["/Lanvin curb.png"], desc: "Масивний дизайн у стилі нульових.", sizes: shoeSizes, category: "Кеди" },
    { id: 4, name: "Balenciaga Runner", price: "5000", images: ["/runner.png"], desc: "Спортивна естетика в деконструйованому стилі.", sizes: shoeSizes, category: "Кросівки" },
    { id: 3, name: "Purple brand flared", price: "1 800", images: ["/Purple brand flared.png"], desc: "Джинси кльош з ідеальною посадкою.", sizes: clothingSizes, category: "Штани та джинси" },
    { id: 5, name: "Stone island sweatshirt", price: "2 600", images: ["/Stone island sweatshirt.png"], desc: "Класичний світшот з м'якої бавовни.", sizes: clothingSizes, category: "Худі та світшоти" },
    { id: 6, name: "Nike sacai", price: "4 200", images: ["/Nike sacai.png"], desc: "Легендарний силует для повсякденного стилю.", sizes: shoeSizes, category: "Кросівки" },
    { id: 7, name: "Bape t shirt", price: "900", images: ["/Bape t shirt.png"], desc: "Базова біла футболка оверсайз.", sizes: clothingSizes, category: "Футболки" },
    { id: 8, name: "Bape t shirt", price: "900", images: ["/Bape t shirt1.png"], desc: "Футболка з яскравим принтом.", sizes: clothingSizes, category: "Футболки" },
    { id: 9, name: "Stone island “zebra” sweater", price: "2 100", images: ["/Stone island “zebra” sweater.png"], desc: "Зручне зіп-худі на кожен день.", sizes: clothingSizes, category: "Худі та світшоти" },
    { id: 10, name: "Gallery dept jeans", price: "1 950", images: ["/Gallery dept jeans.png"], desc: "Широкі джинси з щільного деніму.", sizes: clothingSizes, category: "Штани та джинси" },
  ]);

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedCategory === 'Всі' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); 
    setIsMenuOpen(false);
    
    setTimeout(() => {
      allProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector('.product-scroll-anim');
      const cardWidth = card ? card.offsetWidth + 20 : sliderRef.current.offsetWidth;
      
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const closeProductModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setSelectedSize(null);
      setAddedMsg(false);
      setIsClosingModal(false);
    }, 300);
  };

  const addToCart = (product) => {
    if (!selectedSize) return alert("Спершу обери розмір!");
    setCart([...cart, { ...product, chosenSize: selectedSize, cartId: Date.now() }]);
    setAddedMsg(true);
    setTimeout(() => { 
      closeProductModal();
      setTimeout(() => {
        setIsCartOpen(true);
      }, 350);
    }, 1000);
  };

  const handleCheckout = () => {
    const orderList = cart.map(item => `- ${item.name} (${item.chosenSize}): ${item.price} UAH`).join('\n');
    const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/\s/g, '')), 0);
    const text = encodeURIComponent(`Вітаю! Хочу зробити замовлення:\n\n${orderList}\n\nРазом: ${total} UAH`);
    window.open(`https://t.me/sskarletren?text=${text}`, '_blank');
    setCart([]);
    setIsCartOpen(false);
  };

  const CloseIcon = ({ onClick }) => (
    <div onClick={onClick} className="close-icon-wrapper">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif", opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s', overflowX: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      <div className="top-glow-bar"></div>

      <header className="main-header">
        <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsMenuOpen(true)} className="nav-pill-btn">КАТАЛОГ</button>
            <button onClick={() => setIsCartOpen(true)} className="nav-pill-btn">КОШИК [{cart.length}]</button>
        </div>
        <div className="logo-wrap-3d">
            <h1 className="main-logo-3d">DERZSKIII SHOP</h1>
        </div>
      </header>

      <div className={`drawer-overlay ${isMenuOpen || isCartOpen ? 'visible' : ''}`} onClick={() => { setIsMenuOpen(false); setIsCartOpen(false); }}></div>

      {/* Левая панель (Каталог) */}
      <div className={`side-drawer left-drawer ${isMenuOpen ? 'open' : ''}`}>
          <CloseIcon onClick={() => setIsMenuOpen(false)} />
          <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '20px', marginTop: '30px' }}>КАТАЛОГ</h2>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Пошук товару..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="catalog-content">
            <div className="catalog-section">
              <ul className="catalog-list">
                <li onClick={() => handleCategorySelect('Всі')} className={selectedCategory === 'Всі' ? 'active-category' : ''} style={{ color: selectedCategory === 'Всі' ? '#ff0000' : '' }}>
                  ВСІ ТОВАРИ
                </li>
              </ul>
            </div>

            <div className="catalog-section">
              <h3 className="catalog-subtitle">ОДЯГ</h3>
              <ul className="catalog-list">
                <li onClick={() => handleCategorySelect('Футболки')} className={selectedCategory === 'Футболки' ? 'active-category' : ''}>Футболки</li>
                <li onClick={() => handleCategorySelect('Худі та світшоти')} className={selectedCategory === 'Худі та світшоти' ? 'active-category' : ''}>Худі та світшоти</li>
                <li onClick={() => handleCategorySelect('Штани та джинси')} className={selectedCategory === 'Штани та джинси' ? 'active-category' : ''}>Штани та джинси</li>
              </ul>
            </div>

            <div className="catalog-section">
              <h3 className="catalog-subtitle">ВЗУТТЯ</h3>
              <ul className="catalog-list">
                <li onClick={() => handleCategorySelect('Кросівки')} className={selectedCategory === 'Кросівки' ? 'active-category' : ''}>Кросівки</li>
                <li onClick={() => handleCategorySelect('Кеди')} className={selectedCategory === 'Кеди' ? 'active-category' : ''}>Кеди</li>
              </ul>
            </div>
          </div>
      </div>

      {/* Правая панель (Корзина) */}
      <div className={`side-drawer right-drawer ${isCartOpen ? 'open' : ''}`}>
          <CloseIcon onClick={() => setIsCartOpen(false)} />
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', marginTop: '30px' }}>КОШИК</h2>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#eee" strokeWidth="1" style={{ marginBottom: '10px' }}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p style={{ color: '#bbb', fontSize: '14px', fontWeight: '500' }}>Ваш кошик порожній</p>
              </div>
            ) : cart.map(item => (
              <div key={item.cartId} className="cart-item-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f9f9f9' }}>
                <div style={{ borderLeft: '3px solid #ff0000', paddingLeft: '12px' }}>
                  <p style={{ fontWeight: '800', margin: 0, fontSize: '14px', textTransform: 'uppercase' }}>{item.name}</p>
                  <p style={{ fontSize: '11px', color: '#999', fontWeight: '700', marginTop: '4px' }}>РОЗМІР: <span style={{ color: '#000' }}>{item.chosenSize}</span></p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <p style={{ fontWeight: '900', margin: 0, fontSize: '14px' }}>{item.price} UAH</p>
                  <div style={{ cursor: 'pointer', color: '#ccc' }} onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>РАЗОМ:</span>
                <span style={{ fontWeight: '900', fontSize: '18px', color: '#ff0000' }}>
                    {cart.reduce((sum, item) => sum + parseInt(item.price.replace(/\s/g, '')), 0).toLocaleString()} UAH
                </span>
              </div>
              <button onClick={handleCheckout} className="order-btn-green">
                ОФОРМИТИ ЗАМОВЛЕННЯ
              </button>
            </div>
          )}
      </div>

      <main style={{ flex: 1 }}>
        <section className="hero-section">
          {/* МОБИЛЬНАЯ ВЕРСИЯ БЕЗ ДЫРКИ */}
          <div className="hero-mobile-container">
              <div className="hero-mobile-img-wrap">
                  <img src="/runners-mobile.png" className="hero-mobile-img" alt="" />
                  <div className="hero-mobile-gradient"></div>
                  
                  {/* Текст теперь внутри обертки фото, чтобы товары подтянулись сразу под него */}
                  <div className="hero-content-mobile">
                      <h2 className="hero-text-anim">
                        NEW <br/> <span style={{ color: '#ff0000' }}>DROPS</span>
                      </h2>
                      <div onClick={() => shopRef.current?.scrollIntoView({ behavior: 'smooth' })} className="discover-btn">DISCOVER</div>
                  </div>
              </div>
          </div>

          {/* ПК версия */}
          <div className="hero-pc-content">
              <h2 className="hero-text-anim">
                NEW <br/> <span style={{ color: '#ff0000' }}>DROPS</span>
              </h2>
              <div onClick={() => shopRef.current?.scrollIntoView({ behavior: 'smooth' })} className="discover-btn">DISCOVER</div>
          </div>
        </section>

        <section ref={shopRef} className="shop-section-wrapper section-no-vertical-scroll">
          <h2 className="animated-title">
            NEW DROPS
          </h2>
          
          <div className="slider-relative-container">
            <button className="slider-nav-btn prev" onClick={() => scrollSlider('left')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            
            <div className="products-scroll-container" ref={sliderRef}>
              {products.map((item) => (
                <div key={`drop-${item.id}`} onClick={() => setSelectedProduct(item)} className="product-scroll-anim">
                  <div className="product-card-container">
                    <div className="product-bg">
                      <img className="product-img" src={item.images[0]} alt={item.name} />
                    </div>
                    <h3 className="product-title-text">{item.name}</h3>
                    <p style={{ fontWeight: '900', color: '#ff0000', margin: 0 }}>{item.price} UAH</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="slider-nav-btn next" onClick={() => scrollSlider('right')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </section>

        <section ref={allProductsRef} className="shop-section-wrapper" style={{ paddingTop: '20px' }}>
          <h2 className="animated-title">
            {searchQuery ? `РЕЗУЛЬТАТИ ПОШУКУ: "${searchQuery}"` : (selectedCategory === 'Всі' ? 'ВСІ ТОВАРИ' : selectedCategory.toUpperCase())}
          </h2>
          
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <p style={{ fontWeight: 'bold', color: '#999', fontSize: '18px' }}>Нічого не знайдено :(</p>
              <button onClick={() => {setSelectedCategory('Всі'); setSearchQuery('');}} style={{ background: 'none', border: 'none', color: '#ff0000', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Скинути фільтри</button>
            </div>
          ) : (
            <div className="all-products-grid">
              {filteredProducts.map((item) => (
                <div key={`all-${item.id}`} onClick={() => setSelectedProduct(item)} className="product-scroll-anim">
                  <div className="product-card-container">
                    <div className="product-bg">
                      <img className="product-img" src={item.images[0]} alt={item.name} />
                    </div>
                    <h3 className="product-title-text">{item.name}</h3>
                    <p style={{ fontWeight: '900', color: '#ff0000', margin: 0 }}>{item.price} UAH</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo-section">
            <h2 className="footer-logo-3d">DERZSKIII SHOP</h2>
            <p>Твій стиль. Твій вибір.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Клієнтам</h4>
              <span>Доставка та оплата</span>
              <span>Обмін та повернення</span>
              <span>Контакти</span>
            </div>
            <div className="footer-column">
              <h4>Соцмережі</h4>
              <span>Instagram</span>
              <span>Telegram</span>
              <span>TikTok</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 DERZSKIII SHOP. Всі права захищені.</p>
        </div>
      </footer>

      {selectedProduct && (
        <div className={`modal-overlay ${isClosingModal ? 'closing' : ''}`} onClick={closeProductModal}>
          <div className={`compact-modal ${isClosingModal ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
              <div className="modal-close-pos">
                 <CloseIcon onClick={closeProductModal} />
              </div>
              <div style={{ width: '50px', height: '5px', background: '#ddd', borderRadius: '10px', margin: '0 auto 20px' }}></div>
              <img src={selectedProduct.images[0]} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain' }} alt={selectedProduct.name} />
              <h2 style={{ fontWeight: '900', fontSize: '24px', margin: '15px 0 5px' }}>{selectedProduct.name}</h2>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px' }}>{selectedProduct.desc}</p>
              <p style={{ fontSize: '10px', fontWeight: '900', margin: '0 0 10px 0' }}>ОБЕРІТЬ РОЗМІР</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '25px' }}>
                  {selectedProduct.sizes.map(s => (
                    <div key={s} onClick={() => setSelectedSize(s)} className={`size-btn ${selectedSize === s ? 'selected' : ''}`}>{s}</div>
                  ))}
              </div>
              <button onClick={() => addToCart(selectedProduct)} className={`main-action-btn ${addedMsg ? 'success' : ''}`}>
                {addedMsg ? 'ГАРНИЙ ВИБІР ✓' : `ДОДАТИ — ${selectedProduct.price} UAH`}
              </button>
          </div>
        </div>
      )}

      <style>{`
        /* 3D ВРАЩЕНИЕ ЛОГОТИПА */
        @keyframes rotate3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .logo-wrap-3d { perspective: 1000px; display: flex; align-items: center; }
        .main-logo-3d { font-size: 18px; font-weight: 900; letter-spacing: 1px; margin: 0; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.2); display: inline-block; animation: rotate3d 5s linear infinite; transform-style: preserve-3d; }
        .footer-logo-3d { font-weight: 900; color: #fff; animation: rotate3d 8s linear infinite; display: inline-block; }
        @keyframes textShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
        .animated-title { font-size: 36px; font-weight: 900; margin-bottom: 30px; text-transform: uppercase; line-height: 1; background: linear-gradient(90deg, #000 0%, #000 15%, #ff0000 50%, #000 85%, #000 100%); background-size: 150% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: textShimmer 2.5s ease-in-out infinite alternate; opacity: 0; transform: translateY(20px); transition: all 0.8s ease-out; }
        .animated-title.is-visible { opacity: 1; transform: translateY(0); }
        .search-container { margin-bottom: 25px; }
        .search-input { width: 100%; padding: 12px 20px; border-radius: 12px; border: 1px solid #eee; background: #f9f9f9; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; outline: none; transition: 0.3s; }
        .search-input:focus { border-color: #ff0000; background: #fff; box-shadow: 0 5px 15px rgba(255,0,0,0.05); }
        .main-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 5%; position: fixed; top: 0; left: 0; width: 100%; box-sizing: border-box; z-index: 1000; background: linear-gradient(to bottom, rgba(255, 0, 0, 0.95) 0%, rgba(255, 0, 0, 0.5) 60%, rgba(255, 0, 0, 0) 100%); backdrop-filter: blur(8px); }
        .nav-pill-btn { background: #fff; color: #ff0000; border: none; padding: 6px 16px; border-radius: 50px; font-size: 10px; font-weight: 900; cursor: pointer; transition: 0.3s; }
        .nav-pill-btn:hover { background: #eee; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
        .size-btn { padding: 12px 15px; border: 1px solid #eee; cursor: pointer; border-radius: 8px; font-weight: 700; background: #f5f5f5; transition: all 0.2s ease; }
        .size-btn:hover:not(.selected) { transform: translateY(-3px); border-color: #ff0000; background: #fff; }
        .size-btn.selected { background: #000; color: #fff; border-color: #000; transform: scale(1.05); }
        .main-action-btn { padding: 20px; background: #000; color: #fff; width: 100%; font-weight: 900; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .main-action-btn.success { background: #28a745; animation: btnPop 0.4s ease forwards; }
        .order-btn-green { width: 100%; padding: 18px; background: #28a745; color: #fff; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 13px; transition: all 0.3s ease; }
        .order-btn-green:hover { background: #218838; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3); }
        .shop-section-wrapper { padding: 80px 5%; overflow: hidden; }
        .section-no-vertical-scroll { overflow-y: hidden; }
        .slider-relative-container { position: relative; display: flex; align-items: center; }
        .products-scroll-container { display: flex; gap: 20px; overflow-x: auto; overflow-y: hidden; padding-bottom: 40px; scroll-behavior: smooth; width: 100%; scrollbar-width: none; -ms-overflow-style: none; scroll-snap-type: x mandatory; }
        .products-scroll-container::-webkit-scrollbar { display: none; }
        .all-products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding-bottom: 20px; }
        .product-scroll-anim { flex: 0 0 calc((100% - 60px) / 4); opacity: 0; transform: translateY(60px); transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); scroll-snap-align: start; scroll-snap-stop: always; }
        .product-scroll-anim.is-visible { opacity: 1; transform: translateY(0); }
        .product-card-container { padding: 10px; border-radius: 30px; cursor: pointer; background: transparent; transition: all 0.3s ease; }
        .product-card-container:hover { transform: translateY(-8px); background: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.08); }
        .product-bg { height: 280px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; padding: 20px; border-radius: 30px; transition: all 0.4s ease; overflow: hidden; }
        .product-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.5s ease; }
        .product-card-container:hover .product-img { transform: scale(1.1) rotate(-2deg); }
        .product-title-text { font-size: 16px; font-weight: 700; margin: 15px 0 5px; color: #000; }
        .drawer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 4500; opacity: 0; pointer-events: none; transition: 0.4s ease; backdrop-filter: blur(3px); }
        .drawer-overlay.visible { opacity: 1; pointer-events: auto; }
        .side-drawer { position: fixed; top: 0; width: 100%; max-width: 340px; height: 100%; background: #fff; z-index: 5000; padding: 40px 30px; box-sizing: border-box; display: flex; flex-direction: column; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .left-drawer { left: 0; transform: translateX(-110%); border-radius: 0 30px 30px 0; box-shadow: 12px 0 30px -5px rgba(255, 0, 0, 0.7); }
        .right-drawer { right: 0; transform: translateX(110%); border-radius: 30px 0 0 30px; box-shadow: -12px 0 30px -5px rgba(255, 0, 0, 0.7); }
        .side-drawer.open { transform: translateX(0); }
        .catalog-content { display: flex; flex-direction: column; gap: 30px; overflow-y: auto; }
        .catalog-subtitle { font-size: 14px; color: #999; margin-bottom: 10px; font-weight: 800; letter-spacing: 1px; }
        .catalog-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px; }
        .catalog-list li { font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.2s; position: relative; width: fit-content; }
        .catalog-list li:hover { color: #ff0000; transform: translateX(5px); }
        .active-category { color: #ff0000; transform: translateX(5px); }
        .active-category::after { content: ''; position: absolute; left: -15px; top: 50%; transform: translateY(-50%); width: 6px; height: 6px; background: #ff0000; border-radius: 50%; }
        .main-footer { background: #0a0a0a; color: #fff; padding: 60px 5% 20px; margin-top: auto; }
        .footer-bottom { text-align: center; color: #666; font-size: 12px; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 6000; display: flex; align-items: flex-end; justify-content: center; transition: opacity 0.3s ease; }
        .compact-modal { background: #fff; padding: 30px; width: 100%; max-width: 500px; position: relative; border-radius: 30px 30px 0 0; animation: slideUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
        .close-icon-wrapper { position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #999; transition: all 0.3s; z-index: 100; }
        .close-icon-wrapper:hover { transform: rotate(90deg); color: #ff0000; }
        .slider-nav-btn { background: transparent; border: none; cursor: pointer; transition: 0.3s; z-index: 10; position: absolute; padding: 0; }
        .slider-nav-btn.prev { left: -20px; }
        .slider-nav-btn.next { right: -20px; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        body { margin: 0; padding: 0; overflow-x: hidden; }

        /* --- СТИЛИ ДЛЯ ПК (ОРИГИНАЛ) --- */
        .hero-section { 
          height: 100vh; 
          background: url('/runners.png') center/cover no-repeat; 
          position: relative; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          overflow: hidden;
        }
        .hero-section::after { 
          content: ""; 
          position: absolute; 
          bottom: 0; 
          left: 0; 
          width: 100%; 
          height: 50%; 
          background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0) 100%); 
          z-index: 1; 
        }

        .hero-pc-content { position: relative; z-index: 10; text-align: center; display: block; }
        .hero-mobile-container { display: none; }

        .hero-text-anim { font-size: clamp(60px, 18vw, 150px); font-weight: 900; margin: 0; line-height: 0.8; color: #000; text-shadow: 2px 4px 10px rgba(0, 0, 0, 0.15); text-align: center; }
        .discover-btn { margin-top: 30px; padding: 12px 35px; border: 2px solid #ff0000; background: #ff0000; color: #fff; cursor: pointer; font-weight: 900; border-radius: 50px; font-size: 14px; transition: all 0.3s ease; display: inline-block; }
        .discover-btn:hover { transform: translateY(-5px) scale(1.05); box-shadow: 0 10px 20px rgba(255, 0, 0, 0.4); background: #cc0000; }

        /* --- СТИЛИ ДЛЯ МОБИЛОК (БЕЗ ДЫРКИ) --- */
        @media (max-width: 768px) {
          .hero-section { background: none !important; display: block; height: auto; min-height: auto; }
          .hero-section::after { display: none; }
          .hero-pc-content { display: none; }

          .hero-mobile-container { 
            display: block; 
            width: 100%; 
            position: relative; 
          }

          .hero-mobile-img-wrap { 
            position: relative; 
            width: 100%; 
            height: 80vh; /* Уменьшили высоту, чтоб товары подтянулись */
            background: #f9f9f9;
            overflow: hidden;
          }

          .hero-mobile-img { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
          }

          .hero-mobile-gradient { 
            position: absolute; 
            bottom: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%); 
            z-index: 2; 
          }

          /* Текст прямо по центру картинки */
          .hero-content-mobile { 
            position: absolute; 
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10; 
            text-align: center;
            width: 100%;
          }

          .hero-text-anim { font-size: clamp(40px, 14vw, 75px); }
          
          /* Уменьшаем отступ у первой секции магазина */
          .shop-section-wrapper { padding: 40px 5%; } 
          
          .slider-nav-btn { display: none; }
          .all-products-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .product-scroll-anim { flex: 0 0 75%; }
        }
      `}</style>
    </div>
  )
}

export default App;