import { db } from './dbConfig';
import { Users, Reports, Rewards, CollectedWastes, Notifications, Transactions } from './schema';
import { eq, sql, and, desc, ne } from 'drizzle-orm';

export async function createUser(email: string, name: string) {
  try {
    const [user] = await db.insert(Users).values({ email, name }).returning().execute();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any
) {
  try {
    const [report] = await db
      .insert(Reports)
      .values({
        userId,
        location,
        wasteType,
        amount,
        imageUrl,
        verificationResult,
        status: "pending",
      })
      .returning()
      .execute();

    // Award 10 points for reporting waste
    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);

    // Create a transaction for the earned points
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

    // Create a notification for the user
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      'reward'
    );

    return report;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function getReportsByUserId(userId: number) {
  try {
    const reports = await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
    return reports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getOrCreateReward(userId: number) {
  try {
    let [reward] = await db.select().from(Rewards).where(eq(Rewards.userId, userId)).execute();
    if (!reward) {
      [reward] = await db.insert(Rewards).values({
        userId,
        name: 'Default Reward',
        collectionInfo: 'Default Collection Info',
        points: 0,
        level: 1,
        isAvailable: true,
      }).returning().execute();
    }
    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}


export async function createCollectedWaste(reportId: number, collectorId: number, notes?: string) {
  try {
    const [collectedWaste] = await db
      .insert(CollectedWastes)
      .values({
        reportId,
        collectorId,
        collectionDate: new Date(),
      })
      .returning()
      .execute();
    return collectedWaste;
  } catch (error) {
    console.error("Error creating collected waste:", error);
    return null;
  }
}



export async function getCollectedWastesByCollector(collectorId: number) {
    try {
      return await db.select().from(CollectedWastes).where(eq(CollectedWastes.collectorId, collectorId)).execute();
    } catch (error) {
      console.error("Error fetching collected wastes:", error);
      return [];
    }
  }
  
  export async function createNotification(userId: number, message: string, type: string) {
    try {
      const [notification] = await db
        .insert(Notifications)
        .values({ userId, message, type })
        .returning()
        .execute();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }
  
  export async function getUnreadNotifications(userId: number) {
    try {
      return await db.select().from(Notifications).where(
        and(
          eq(Notifications.userId, userId),
          eq(Notifications.isRead, false)
        )
      ).execute();
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      return [];
    }
  }
  
  export async function markNotificationAsRead(notificationId: number) {
    try {
      await db.update(Notifications).set({ isRead: true }).where(eq(Notifications.id, notificationId)).execute();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }



  export async function getPendingReports() {
    try {
      return await db.select().from(Reports).where(eq(Reports.status, "pending")).execute();
    } catch (error) {
      console.error("Error fetching pending reports:", error);
      return [];
    }
  }
  
  export async function updateReportStatus(reportId: number, status: string) {
    try {
      const [updatedReport] = await db
        .update(Reports)
        .set({ status })
        .where(eq(Reports.id, reportId))
        .returning()
        .execute();
      return updatedReport;
    } catch (error) {
      console.error("Error updating report status:", error);
      return null;
    }
  }
  
  export async function getRecentReports(limit: number = 10) {
    try {
      const reports = await db
        .select()
        .from(Reports)
        .orderBy(desc(Reports.createdAt))
        .limit(limit)
        .execute();
      return reports;
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      return [];
    }
  }
  
  export async function getWasteCollectionTasks(limit: number = 20) {
    try {
      const tasks = await db
        .select({
          id: Reports.id,
          location: Reports.location,
          wasteType: Reports.wasteType,
          amount: Reports.amount,
          status: Reports.status,
          date: Reports.createdAt,
          collectorId: Reports.collectorId,
        })
        .from(Reports)
        .limit(limit)
        .execute();
  
      return tasks.map(task => ({
        ...task,
        date: task.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      }));
    } catch (error) {
      console.error("Error fetching waste collection tasks:", error);
      return [];
    }
  }
  