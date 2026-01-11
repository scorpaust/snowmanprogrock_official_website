import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, Package, Music, Download } from "lucide-react";
import type { Product, Category } from "@shared/schema";
import { CommentSection } from "@/components/CommentSection";

interface ProductDetailProps {
  language?: string;
}

export default function ProductDetail({ language = 'pt' }: ProductDetailProps) {
  const [, params] = useRoute("/loja/produto/:id");
  const productId = params?.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();

  const translations = {
    pt: {
      backToStore: "Voltar à Loja",
      addToCart: "Adicionar ao Carrinho",
      outOfStock: "Esgotado",
      digital: "Digital",
      physical: "Físico",
      inStock: "Em stock",
      limitedStock: "Stock limitado",
      featured: "Destaque",
      category: "Categoria",
      type: "Tipo",
      downloadIncluded: "Download incluído",
      productNotFound: "Produto não encontrado",
      productNotFoundDesc: "O produto que procura não existe ou foi removido.",
      addedToCart: "Adicionado ao carrinho!",
      productAdded: "foi adicionado ao carrinho.",
      quantity: "Quantidade",
    },
    en: {
      backToStore: "Back to Store",
      addToCart: "Add to Cart",
      outOfStock: "Out of Stock",
      digital: "Digital",
      physical: "Physical",
      inStock: "In stock",
      limitedStock: "Limited stock",
      featured: "Featured",
      category: "Category",
      type: "Type",
      downloadIncluded: "Download included",
      productNotFound: "Product not found",
      productNotFoundDesc: "The product you're looking for doesn't exist or has been removed.",
      addedToCart: "Added to cart!",
      productAdded: "has been added to your cart.",
      quantity: "Quantity",
    },
    es: {
      backToStore: "Volver a la Tienda",
      addToCart: "Añadir al Carrito",
      outOfStock: "Agotado",
      digital: "Digital",
      physical: "Físico",
      inStock: "En stock",
      limitedStock: "Stock limitado",
      featured: "Destacado",
      category: "Categoría",
      type: "Tipo",
      downloadIncluded: "Descarga incluida",
      productNotFound: "Producto no encontrado",
      productNotFoundDesc: "El producto que buscas no existe o ha sido eliminado.",
      addedToCart: "¡Añadido al carrito!",
      productAdded: "se ha añadido a tu carrito.",
      quantity: "Cantidad",
    },
    fr: {
      backToStore: "Retour à la Boutique",
      addToCart: "Ajouter au Panier",
      outOfStock: "Épuisé",
      digital: "Numérique",
      physical: "Physique",
      inStock: "En stock",
      limitedStock: "Stock limité",
      featured: "En vedette",
      category: "Catégorie",
      type: "Type",
      downloadIncluded: "Téléchargement inclus",
      productNotFound: "Produit non trouvé",
      productNotFoundDesc: "Le produit que vous recherchez n'existe pas ou a été supprimé.",
      addedToCart: "Ajouté au panier!",
      productAdded: "a été ajouté à votre panier.",
      quantity: "Quantité",
    },
    de: {
      backToStore: "Zurück zum Shop",
      addToCart: "In den Warenkorb",
      outOfStock: "Ausverkauft",
      digital: "Digital",
      physical: "Physisch",
      inStock: "Auf Lager",
      limitedStock: "Begrenzter Vorrat",
      featured: "Hervorgehoben",
      category: "Kategorie",
      type: "Typ",
      downloadIncluded: "Download enthalten",
      productNotFound: "Produkt nicht gefunden",
      productNotFoundDesc: "Das gesuchte Produkt existiert nicht oder wurde entfernt.",
      addedToCart: "Zum Warenkorb hinzugefügt!",
      productAdded: "wurde Ihrem Warenkorb hinzugefügt.",
      quantity: "Menge",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.pt;

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1);
      toast({
        title: t.addedToCart,
        description: `${getProductName(product)} ${t.productAdded}`,
      });
    }
  };

  const getProductName = (product: Product) => {
    return language === 'en' && product.nameEn ? product.nameEn : product.name;
  };

  const getProductDescription = (product: Product) => {
    return language === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    if (!category) return '';
    return language === 'en' && category.nameEn ? category.nameEn : category.name;
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4" data-testid="text-not-found">{t.productNotFound}</h1>
            <p className="text-muted-foreground mb-8">{t.productNotFoundDesc}</p>
            <Link href="/loja">
              <Button data-testid="button-back-to-store">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToStore}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.type === 'physical' && (product.stock ?? 0) === 0;
  const isLowStock = product.type === 'physical' && (product.stock ?? 0) > 0 && (product.stock ?? 0) < 10;
  const images = product.images || ['https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80'];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/loja">
            <Button variant="ghost" data-testid="button-back-to-store">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToStore}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="mb-4 relative bg-black rounded-md h-96">
              <img
                src={images[selectedImageIndex]}
                alt={getProductName(product)}
                className="w-full h-full object-contain"
                data-testid="img-product-main"
              />
              {product.featured === 1 && (
                <Badge className="absolute top-4 left-4 bg-purple-600" data-testid="badge-featured">
                  <Music className="mr-1 h-3 w-3" />
                  {t.featured}
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`border-2 rounded-md overflow-hidden transition-all bg-black h-20 ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-gray-600'
                    }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img
                      src={img}
                      alt={`${getProductName(product)} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2" data-testid="text-product-name">
                {getProductName(product)}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge variant={product.type === 'digital' ? 'secondary' : 'outline'} data-testid="badge-type">
                  {product.type === 'digital' ? t.digital : t.physical}
                </Badge>
                {product.type === 'physical' && !isOutOfStock && (
                  <Badge variant={isLowStock ? 'destructive' : 'outline'} data-testid="badge-stock">
                    {isLowStock ? t.limitedStock : t.inStock} ({product.stock})
                  </Badge>
                )}
              </div>
              <p className="text-5xl font-bold text-primary mb-6" data-testid="text-product-price">
                €{(product.price / 100).toFixed(2)}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Descrição</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-product-description">
                {getProductDescription(product)}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>{t.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium" data-testid="text-category">
                    {getCategoryName(product.categoryId)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>{t.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium" data-testid="text-type">
                    {product.type === 'digital' ? t.digital : t.physical}
                  </p>
                </CardContent>
              </Card>
            </div>

            {product.type === 'digital' && product.downloadUrl && (
              <div className="mb-6">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-primary">
                      <Download className="h-5 w-5" />
                      <span className="font-medium">{t.downloadIncluded}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              data-testid="button-add-to-cart"
            >
              {isOutOfStock ? (
                t.outOfStock
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t.addToCart}
                </>
              )}
            </Button>
          </div>
        </div>

        <CommentSection 
          contentType="product" 
          contentId={product.id} 
          language={language} 
        />
      </div>
    </div>
  );
}
