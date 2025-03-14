import { Button } from "@/components/ui/button";
import { FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";

interface ShareBookingProps {
  location: string;
  date: string;
  package: string;
}

export function ShareBooking({ location, date, package: pkg }: ShareBookingProps) {
  const shareText = `I just booked a BBQ experience with Barby & Ken at ${location} on ${date}! Who wants to join my party? 🎉\nBook your own Barby here: ${window.location.origin}/booking and have Ken set it up for you! 🔥🍖`;
  const encodedText = encodeURIComponent(shareText);

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          url: window.location.href,
        });
        toast({
          title: "Shared successfully!",
          description: "Thanks for sharing your BBQ experience!",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      toast({
        title: "Choose a platform",
        description: "Select one of the social media platforms below to share.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleShare}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        Share Booking
      </Button>

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => window.open(shareUrls.whatsapp, '_blank')}
          className="flex items-center justify-center gap-2 hover:bg-green-50"
        >
          <FaWhatsapp className="w-5 h-5 text-green-600" />
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(shareUrls.facebook, '_blank')}
          className="flex items-center justify-center gap-2 hover:bg-blue-50"
        >
          <FaFacebook className="w-5 h-5 text-blue-600" />
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(shareUrls.twitter, '_blank')}
          className="flex items-center justify-center gap-2 hover:bg-sky-50"
        >
          <FaTwitter className="w-5 h-5 text-sky-600" />
        </Button>
      </div>
    </div>
  );
}