import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, ChevronDown, ChevronUp, MoreVertical, MessageSquare } from 'lucide-react';
import { ProductFeedbackModal } from './ProductFeedbackModal';

interface Product {
  id: string;
  title: string;
  price: number | string;
  discounted_price: number | string;
  url: string;
  image: string;
  description: string;
  brand?: string;
  category?: string;
  score?: number;
  rank?: number;
}

interface ProductCardProps {
  product: Product;
  sessionId?: string;
  messageId?: string;
  onFeedbackSuccess?: () => void;
}

export function ProductCard({ product, sessionId, messageId, onFeedbackSuccess }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const formatPrice = (price: number | string) => {
    // Remove commas from string prices before parsing
    const cleanPrice = typeof price === 'string' ? price.replace(/,/g, '') : price;
    const numPrice = typeof cleanPrice === 'string' ? parseFloat(cleanPrice) : cleanPrice;
    if (isNaN(numPrice)) return '₹0';
    // Format as Indian currency with proper comma placement
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  const getPriceAsNumber = (price: number | string) => {
    // Remove commas from string prices before parsing
    const cleanPrice = typeof price === 'string' ? price.replace(/,/g, '') : price;
    const numPrice = typeof cleanPrice === 'string' ? parseFloat(cleanPrice) : cleanPrice;
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const hasDiscount = product.discounted_price &&
    getPriceAsNumber(product.discounted_price) !== getPriceAsNumber(product.price) &&
    getPriceAsNumber(product.discounted_price) > 0;

  const canProvideFeedback = sessionId && messageId;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = '/shopping-assistant-fo5Sg.png';
            }}
          />
          {canProvideFeedback && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                    aria-label="Product options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsFeedbackModalOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Give Feedback
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <CardHeader className="space-y-2 md:space-y-3 pb-2 md:pb-3 p-3 md:p-6">
          <CardTitle className="text-sm md:text-base font-semibold line-clamp-2 leading-tight">
            {product.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  {formatPrice(product.discounted_price)}
                </span>
                <span className="text-xs md:text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xl md:text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 p-3 md:p-6 md:pt-0">
          {product.description && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs md:text-sm font-medium text-foreground hover:text-primary transition-colors py-1 min-h-[44px] md:min-h-0 -my-1 md:my-0"
              >
                {isExpanded ? (
                  <>
                    Hide Details <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                  </>
                )}
              </button>
              {isExpanded && (
                <p className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          )}
          {product.brand && (
            <div className="text-xs md:text-sm text-muted-foreground">
              Brand: <span className="font-medium text-foreground">{product.brand}</span>
            </div>
          )}
          <Button asChild className="w-full min-h-[44px] md:min-h-0 text-sm">
            <a href={product.url} target="_blank" rel="noopener noreferrer">
              View Product <ExternalLink className="ml-2 h-3 w-3 md:h-4 md:w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {canProvideFeedback && (
        <ProductFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          productId={product.id}
          productTitle={product.title}
          sessionId={sessionId}
          messageId={messageId}
          onSuccess={() => {
            onFeedbackSuccess?.();
          }}
        />
      )}
    </>
  );
}
