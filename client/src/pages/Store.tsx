import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, Music, Disc } from "lucide-react";
import { Link } from "wouter";
import type { Product, Category } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

interface StoreProps {
  language?: string;
}

const seoByLang: Record<string, { title: string; description: string }> = {
  pt: { title: "Loja", description: "Loja oficial Snowman. Compra álbuns, merchandise e produtos digitais da banda de rock progressivo de Portugal." },
  en: { title: "Store", description: "Official Snowman store. Buy albums, merchandise and digital products from Portugal's progressive rock band." },
  fr: { title: "Boutique", description: "Boutique officielle Snowman. Achetez albums, merchandise et produits numériques du groupe de rock progressif." },
  es: { title: "Tienda", description: "Tienda oficial Snowman. Compra álbumes, merchandise y productos digitales de la banda de rock progresivo de Portugal." },
  de: { title: "Shop", description: "Offizieller Snowman Shop. Kaufen Sie Alben, Merchandise und digitale Produkte der Progressive-Rock-Band aus Portugal." },
};

export default function Store({ language = 'pt' }: StoreProps) {
  const seo = seoByLang[language] || seoByLang.pt;
  useSEO({ title: seo.title, description: seo.description, url: "/loja", lang: language });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  const translations = {
    pt: {
      title: "Loja",
      subtitle: "Produtos oficiais da banda Snowman",
      allProducts: "Todos os Produtos",
      addToCart: "Adicionar ao Carrinho",
      outOfStock: "Esgotado",
      digital: "Digital",
      physical: "Físico",
      inStock: "Em stock",
      limitedStock: "Stock limitado",
      featured: "Destaque",
      goToCheckout: "Ir para Checkout",
      continueShopping: "Continuar a Comprar",
      addedToCart: "Adicionado ao carrinho!",
      productAdded: "produto foi adicionado ao carrinho.",
      loading: "Carregando...",
    },
    en: {
      title: "Store",
      subtitle: "Official Snowman band products",
      allProducts: "All Products",
      addToCart: "Add to Cart",
      outOfStock: "Out of Stock",
      digital: "Digital",
      physical: "Physical",
      inStock: "In stock",
      limitedStock: "Limited stock",
      featured: "Featured",
      goToCheckout: "Go to Checkout",
      continueShopping: "Continue Shopping",
      addedToCart: "Added to cart!",
      productAdded: "has been added to your cart.",
      loading: "Loading...",
    },
    es: {
      title: "Tienda",
      subtitle: "Productos oficiales de la banda Snowman",
      allProducts: "Todos los Productos",
      addToCart: "Añadir al Carrito",
      outOfStock: "Agotado",
      digital: "Digital",
      physical: "Físico",
      inStock: "En stock",
      limitedStock: "Stock limitado",
      featured: "Destacado",
      goToCheckout: "Ir al Checkout",
      continueShopping: "Seguir Comprando",
      addedToCart: "¡Añadido al carrito!",
      productAdded: "se ha añadido a tu carrito.",
      loading: "Cargando...",
    },
    fr: {
      title: "Boutique",
      subtitle: "Produits officiels du groupe Snowman",
      allProducts: "Tous les Produits",
      addToCart: "Ajouter au Panier",
      outOfStock: "Épuisé",
      digital: "Numérique",
      physical: "Physique",
      inStock: "En stock",
      limitedStock: "Stock limité",
      featured: "En vedette",
      goToCheckout: "Aller au Checkout",
      continueShopping: "Continuer les Achats",
      addedToCart: "Ajouté au panier!",
      productAdded: "a été ajouté à votre panier.",
      loading: "Chargement...",
    },
    de: {
      title: "Shop",
      subtitle: "Offizielle Snowman Band Produkte",
      allProducts: "Alle Produkte",
      addToCart: "In den Warenkorb",
      outOfStock: "Ausverkauft",
      digital: "Digital",
      physical: "Physisch",
      inStock: "Auf Lager",
      limitedStock: "Begrenzter Vorrat",
      featured: "Hervorgehoben",
      goToCheckout: "Zur Kasse",
      continueShopping: "Weiter Einkaufen",
      addedToCart: "Zum Warenkorb hinzugefügt!",
      productAdded: "wurde Ihrem Warenkorb hinzugefügt.",
      loading: "Laden...",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.pt;

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = selectedCategory
    ? allProducts?.filter(p => p.categoryId === selectedCategory && p.isActive)
    : allProducts?.filter(p => p.isActive);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({
      title: t.addedToCart,
      description: `${getProductName(product)} ${t.productAdded}`,
    });
  };

  const getProductName = (product: Product) => {
    const map: Record<string, string | null | undefined> = {
      en: product.nameEn,
      fr: product.nameFr,
      es: product.nameEs,
      de: product.nameDe,
    };
    return map[language] || product.name;
  };

  const getProductDescription = (product: Product) => {
    const map: Record<string, string | null | undefined> = {
      en: product.descriptionEn,
      fr: product.descriptionFr,
      es: product.descriptionEs,
      de: product.descriptionDe,
    };
    return map[language] || product.description;
  };

  const getCategoryName = (category: Category) => {
    const map: Record<string, string | null | undefined> = {
      en: category.nameEn,
      fr: category.nameFr,
      es: category.nameEs,
      de: category.nameDe,
    };
    return map[language] || category.name;
  };

  if (categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-muted-foreground">{t.loading}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent" data-testid="text-store-title">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-store-subtitle">
            {t.subtitle}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            data-testid="button-filter-all"
          >
            {t.allProducts}
          </Button>
          {categories?.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`button-filter-${category.slug}`}
            >
              {category.slug === 'discografia' ? <Music className="mr-2 h-4 w-4" /> : <Package className="mr-2 h-4 w-4" />}
              {getCategoryName(category)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredProducts?.map(product => {
            const isOutOfStock = product.type === 'physical' && (product.stock ?? 0) === 0;
            const isLowStock = product.type === 'physical' && (product.stock ?? 0) > 0 && (product.stock ?? 0) < 10;

            return (
              <Card key={product.id} className="h-full flex flex-col" data-testid={`card-product-${product.id}`}>
                <Link href={`/loja/produto/${product.id}`} data-testid={`link-product-${product.id}`}>
                  <CardHeader className="p-0 cursor-pointer">
                    <div className="relative w-full h-64 overflow-hidden rounded-t-md bg-black">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80'}
                        alt={getProductName(product)}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        data-testid={`img-product-${product.id}`}
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.featured === 1 && (
                          <Badge className="bg-purple-600" data-testid={`badge-featured-${product.id}`}>
                            <Disc className="mr-1 h-3 w-3" />
                            {t.featured}
                          </Badge>
                        )}
                        {product.type === 'digital' && (
                          <Badge variant="secondary" data-testid={`badge-type-${product.id}`}>
                            {t.digital}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Link>
                <CardContent className="flex-1 flex flex-col pt-6">
                  <Link href={`/loja/produto/${product.id}`}>
                    <CardTitle className="mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]" data-testid={`text-product-name-${product.id}`}>
                      {getProductName(product)}
                    </CardTitle>
                  </Link>
                  <CardDescription className="mb-4 line-clamp-3 min-h-[4rem]" data-testid={`text-product-description-${product.id}`}>
                    {getProductDescription(product)}
                  </CardDescription>
                  <div className="mt-auto flex items-center gap-2 flex-wrap min-h-[1.5rem]">
                    {product.type === 'physical' && !isOutOfStock && (
                      <Badge variant={isLowStock ? "destructive" : "outline"} data-testid={`badge-stock-${product.id}`}>
                        {isLowStock ? t.limitedStock : t.inStock} ({product.stock})
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex flex-col items-start gap-3 pt-6">
                  <div className="text-2xl font-bold" data-testid={`text-product-price-${product.id}`}>
                    €{(product.price / 100).toFixed(2)}
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className="w-full"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    {isOutOfStock ? (
                      t.outOfStock
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t.addToCart}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              {language === 'pt' ? 'Nenhum produto encontrado nesta categoria.' :
               language === 'en' ? 'No products found in this category.' :
               language === 'es' ? 'No se encontraron productos en esta categoría.' :
               language === 'fr' ? 'Aucun produit trouvé dans cette catégorie.' :
               'Keine Produkte in dieser Kategorie gefunden.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
