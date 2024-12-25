import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

async function reviewHospital(
  userId: string,
  hospitalId: string,
  rating: number,
  review: string,
) {
  if (rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5" };
  }

  const db = await getDb();

  const reviewDoc = {
    userId,
    hospitalId,
    rating,
    review,
    date: new Date(),
  };

  const reviewResult = await db.collection("reviews").insertOne(reviewDoc);
  if (!reviewResult.acknowledged) {
    return { success: false, message: "Failed to submit the review" };
  }

  const reviews = await db
    .collection("reviews")
    .aggregate([
      { $match: { hospitalId } },
      { $group: { _id: "$hospitalId", avgRating: { $avg: "$rating" } } },
    ])
    .toArray();

  if (reviews.length > 0) {
    const avgRating = reviews[0].avgRating;

    const updateResult = await db
      .collection("hospitals")
      .updateOne(
        { _id: new ObjectId(hospitalId) },
        { $set: { rating: avgRating } },
      );

    if (!updateResult.modifiedCount) {
      return { success: false, message: "Failed to update hospital rating" };
    }
  }

  return { success: true, message: "Review submitted successfully" };
}

async function getHospitalRatingAndReviews(hospitalId: string) {
  const db = await getDb();

  const hospital = await db
    .collection("hospitals")
    .findOne({ _id: new ObjectId(hospitalId) });

  if (!hospital) {
    return { success: false, message: "Hospital not found" };
  }

  const reviews = await db.collection("reviews").find({ hospitalId }).toArray();

  return {
    success: true,
    hospitalRating: hospital.rating,
    reviews,
  };
}

async function reviewPatient(
  ratedBy: string,
  userId: string,
  rating: number,
  review: string,
) {
  if (rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5" };
  }

  const db = await getDb();

  const ratingDoc = {
    ratedBy,
    userId,
    rating,
    review,
    date: new Date(),
  };

  const ratingResult = await db.collection("reviews").insertOne(ratingDoc);
  if (!ratingResult.acknowledged) {
    return { success: false, message: "Failed to submit the rating" };
  }

  const ratings = await db
    .collection("reviews")
    .aggregate([
      { $match: { userId } },
      { $group: { _id: "$userId", avgRating: { $avg: "$rating" } } },
    ])
    .toArray();

  console.log(ratings);

  if (ratings.length > 0) {
    const avgRating = ratings[0].avgRating;

    const updateResult = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId), tier: 0 },
        { $set: { rating: avgRating } },
      );

    if (!updateResult) {
      return { success: false, message: "Failed to update user rating" };
    }
  }

  return { success: true, message: "Rating submitted successfully" };
}

export { reviewHospital, getHospitalRatingAndReviews, reviewPatient };
