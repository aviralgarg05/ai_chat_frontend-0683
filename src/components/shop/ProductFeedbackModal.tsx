import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  sessionId: string;
  messageId: string;
  userQuery?: string;
  onSuccess: () => void;
}

const REASON_OPTIONS = [
  'Not relevant to my query',
  'Too expensive / price mismatch',
  'Poor image or unclear product',
  'Missing key details (size/material/specs)',
  'Better alternatives recommended',
  'Incorrect category or tags',
  'Outdated or unavailable item',
  'Quality concerns / looks cheap',
  "Style doesn't match examples",
  'Delivery / shipping concerns',
];

const FEEDBACK_CATEGORIES = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'quality', label: 'Quality' },
  { value: 'style', label: 'Style' },
  { value: 'availability', label: 'Availability' },
  { value: 'specs', label: 'Specs' },
  { value: 'usability', label: 'Usability' },
  { value: 'other', label: 'Other' },
];

export function ProductFeedbackModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  sessionId,
  messageId,
  userQuery: initialUserQuery,
  onSuccess,
}: ProductFeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('');
  const [userQuery, setUserQuery] = useState(initialUserQuery || '');
  const [moreDetails, setMoreDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update userQuery when initialUserQuery changes
  useEffect(() => {
    if (initialUserQuery) {
      setUserQuery(initialUserQuery);
    }
  }, [initialUserQuery]);

  const handleReasonToggle = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else if (selectedReasons.length < 3) {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Format reason: send selected predefined reasons as array (or single string if only one)
      // Send custom reason and more details in reason_text
      const reasonValue = selectedReasons.length > 0 
        ? (selectedReasons.length === 1 ? selectedReasons[0] : selectedReasons)
        : null;

      // Combine custom reason and more details into reason_text
      const reasonTextParts = [];
      if (customReason.trim()) {
        reasonTextParts.push(customReason.trim());
      }
      if (moreDetails.trim()) {
        reasonTextParts.push(moreDetails.trim());
      }
      const reasonTextValue = reasonTextParts.length > 0 ? reasonTextParts.join(' ') : null;

      const payload = {
        sessionId,
        messageID: messageId,
        productId,
        rating,
        reason: reasonValue,
        reason_text: reasonTextValue,
        user_query: userQuery.trim() || null,
        feedback_type: feedbackCategory || null,
      };

      const API_BASE = 'https://49627f66c3c3.ngrok-free.app';
      const response = await fetch(`${API_BASE}/api/feedback/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success('Thanks — your feedback was submitted.');
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Failed to submit feedback. Please try again.');
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setSelectedReasons([]);
    setShowCustomReason(false);
    setCustomReason('');
    setFeedbackCategory('');
    setUserQuery('');
    setMoreDetails('');
    setError('');
    onClose();
  };

  const cleanHtml = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 md:p-6 max-w-full md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Give Feedback</DialogTitle>
          <DialogDescription className="text-xs md:text-sm line-clamp-2">
            {cleanHtml(productTitle)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-2">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="min-w-[44px] min-h-[44px] md:min-w-[40px] md:min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary rounded-md transition-colors"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={cn(
                      'w-7 h-7 md:w-8 md:h-8 transition-colors',
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Reason (select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {REASON_OPTIONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleReasonToggle(reason)}
                  disabled={
                    !selectedReasons.includes(reason) && selectedReasons.length >= 3
                  }
                  className={cn(
                    'px-3 py-2 rounded-full text-xs md:text-sm border transition-all min-h-[44px] md:min-h-[36px]',
                    selectedReasons.includes(reason)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-border hover:border-primary',
                    !selectedReasons.includes(reason) &&
                      selectedReasons.length >= 3 &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  {reason}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomReason(!showCustomReason)}
                className={cn(
                  'px-3 py-2 rounded-full text-xs md:text-sm border transition-all min-h-[44px] md:min-h-[36px]',
                  showCustomReason
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary'
                )}
              >
                + Add custom
              </button>
            </div>
            {selectedReasons.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedReasons.length}/3 reasons selected
              </p>
            )}
          </div>

          {showCustomReason && (
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Reason</label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value.slice(0, 200))}
                placeholder="Describe your reason..."
                className="min-h-[80px] text-sm"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {customReason.length}/200
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Feedback Category (optional)
            </label>
            <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
              <SelectTrigger className="min-h-[44px] md:min-h-[40px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Original Search/Request {initialUserQuery ? '(pre-filled)' : '(optional)'}
            </label>
            <Textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value.slice(0, 500))}
              placeholder="What were you looking for?"
              className="min-h-[80px] text-sm"
              maxLength={500}
              disabled={!!initialUserQuery}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {userQuery.length}/500
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              More Details (optional)
            </label>
            <Textarea
              value={moreDetails}
              onChange={(e) => setMoreDetails(e.target.value.slice(0, 1000))}
              placeholder="Any additional feedback..."
              className="min-h-[100px] text-sm"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {moreDetails.length}/1000
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 min-h-[44px]"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
