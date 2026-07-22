"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/lib/api/endpoints/reviews";

interface ReviewModalProps {
  productId: string;
  orderId: string;
  productName: string;
  existingReview?: { _id: string; rating: number; comment: string };
  onClose: () => void;
}

export default function ReviewModal({ productId, orderId, productName, existingReview, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState("");

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter your comment.");
      return;
    }

    try {
      if (existingReview) {
        await updateReview({ id: existingReview._id, productId, rating, comment }).unwrap();
        toast.success("Review updated");
      } else {
        await createReview({ productId, orderId, rating, comment }).unwrap();
        toast.success("Review submitted");
      }
      onClose();
    } catch (err) {
      setError((err as { data?: { error?: string } })?.data?.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h2 className="text-2xl font-semibold mb-1 text-gray-900 dark:text-white">
          {existingReview ? "Edit Review" : "Write a Review"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{productName}</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 rounded-lg p-2">{error}</p>
          )}

          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Rate this product</label>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer text-3xl transition-transform duration-150 hover:scale-110"
                  aria-label={`${star} star`}
                >
                  <i
                    className={
                      star <= (hoverRating || rating)
                        ? "fas fa-star text-yellow-400"
                        : "far fa-star text-gray-300 dark:text-gray-600"
                    }
                  ></i>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {rating > 0 ? `You rated ${rating} star${rating > 1 ? "s" : ""}` : "Click to rate this product"}
            </p>
          </div>

          <div>
            <label htmlFor="comment" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Comment
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Write your review here..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 dark:bg-green-800 dark:hover:bg-green-900 text-white py-2 rounded-md font-semibold transition"
          >
            {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
          </button>
        </form>

        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
