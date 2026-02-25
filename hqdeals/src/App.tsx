import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import banner from "/banner.svg";
import "./App.css";

interface Category {
  value: string;
  text: string;
}

interface Categories {
  timestamp: number;
  dir: string;
  categories: Category[];
}

interface Price {
  current: number;
  original: number;
}

interface Reviews {
  rating: number;
  count: number;
}

interface Link {
  ref: string;
  rel: string;
}

interface Offer {
  title: string;
  asin: string;
  reviews: Reviews;
  price: Price;
  image: string;
  link: Link;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Categories>({
    timestamp: 0,
    dir: "",
    categories: [],
  });
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= Math.round(rating) ? "#fbbf24" : "none"}
          stroke={"#fbbf24"}
          strokeWidth={2}
        />,
      );
    }
    return stars;
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://hqdeals.github.io//offers/categories.json?t=${Date.now()}`,
        );
        const data = await response.json();
        setCategories(data);
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].value);
        }
      } catch (error) {
        console.error(`Failed to load categories:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadOffers = async () => {
      if (!selectedCategory) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://hqdeals.github.io/offers/${categories.dir}/${selectedCategory}.json`,
        );
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error(`Failed to load offers for ${selectedCategory}:`, error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [categories.dir, selectedCategory]);

  return (
    <>
      <div className="header-section">
        <h1>
          <a href="https://hqdeals.github.io/" target="_blank">
            <img src={banner} alt="HQ Deals" />
          </a>
        </h1>
        <div className="disclaimer">
          <p>⚠️ Under construction ⚠️</p>
        </div>
      </div>

      <div className="description-section">
        <p>
          Ausgewählte Angebote mit deutlichen Preisreduzierungen von
          vertrauenswürdigen Händlern.
        </p>
        <p className="last-updated">
          Zuletzt aktualisiert:{" "}
          {new Date(categories.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="filter-section">
        <label htmlFor="category">Kategorie: </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.text}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Angebote werden geladen...</p>
      ) : (
        <div className="offers-grid">
          {offers.map((offer) => (
            <div key={offer.asin} className="offer-card">
              <img src={offer.image} alt={offer.title} />
              <div className="offer-content">
                <h3 title={offer.title}>{offer.title}</h3>
                <div className="price-section">
                  <span className="price">
                    €{offer.price.current.toFixed(2)}
                  </span>
                  <span className="original-price">
                    €{offer.price.original.toFixed(2)}
                  </span>
                  <span className="discount">
                    {
                      -(
                        ((offer.price.original - offer.price.current) /
                          offer.price.original) *
                        100
                      ).toFixed(0)
                    }
                    %
                  </span>
                </div>
                <div className="reviews">
                  <span className="rating">
                    {offer.reviews.rating.toFixed(1)}
                  </span>
                  <span>{renderStars(offer.reviews.rating)}</span>
                  <span className="count">({offer.reviews.count})</span>
                </div>
                <a
                  href={offer.link.ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="offer-button"
                >
                  Auf {offer.link.rel} ansehen
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
