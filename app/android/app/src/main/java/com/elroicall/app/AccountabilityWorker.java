package com.elroicall.app;

import android.app.AppOpsManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Process;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class AccountabilityWorker extends Worker {
    static final String PREFS = "elroi_walk_with_me";
    static final String WORK_NAME = "elroi_walk_with_me_check";
    private static final String CHANNEL_ID = "walk_with_me";
    private static final int NOTIFICATION_ID = 4107;

    public AccountabilityWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    static void syncSchedule(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean enabled = prefs.getBoolean("enabled", false);
        String goals = prefs.getString("goals", "[]");
        if (!enabled || "[]".equals(goals) || !hasUsageAccess(context)) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME);
            return;
        }
        PeriodicWorkRequest request =
            new PeriodicWorkRequest.Builder(AccountabilityWorker.class, 15, TimeUnit.MINUTES)
                .build();
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            request
        );
    }

    static boolean hasUsageAccess(Context context) {
        AppOpsManager appOps =
            (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.getPackageName()
        );
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    static String todayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new java.util.Date());
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("enabled", false) || !hasUsageAccess(context)) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME);
            return Result.success();
        }

        String today = todayKey();
        if (today.equals(prefs.getString("snoozed_date", ""))) return Result.success();
        if (today.equals(prefs.getString("last_notification_date", ""))) return Result.success();

        try {
            JSONArray goals = new JSONArray(prefs.getString("goals", "[]"));
            if (goals.length() == 0) return Result.success();

            Calendar startCalendar = Calendar.getInstance();
            startCalendar.set(Calendar.HOUR_OF_DAY, 0);
            startCalendar.set(Calendar.MINUTE, 0);
            startCalendar.set(Calendar.SECOND, 0);
            startCalendar.set(Calendar.MILLISECOND, 0);

            UsageStatsManager manager =
                (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
            List<UsageStats> stats = manager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startCalendar.getTimeInMillis(),
                System.currentTimeMillis()
            );
            Map<String, Long> minutes = new HashMap<>();
            if (stats != null) {
                for (UsageStats stat : stats) {
                    String packageName = stat.getPackageName();
                    long current = minutes.containsKey(packageName)
                        ? minutes.get(packageName)
                        : 0L;
                    minutes.put(
                        packageName,
                        current + Math.max(0, stat.getTotalTimeInForeground() / 60000L)
                    );
                }
            }

            for (int index = 0; index < goals.length(); index++) {
                JSONObject goal = goals.getJSONObject(index);
                String packageName = goal.optString("packageName", "");
                String label = goal.optString("label", "this app");
                int target = Math.max(1, goal.optInt("minutes", 30));
                long used = minutes.containsKey(packageName) ? minutes.get(packageName) : 0L;
                if (used < target) continue;
                sendGentleNotification(context, label, target, prefs.getString("intention", ""));
                prefs.edit().putString("last_notification_date", today).apply();
                break;
            }
            return Result.success();
        } catch (Exception ignored) {
            return Result.success();
        }
    }

    private void sendGentleNotification(
        Context context,
        String appLabel,
        int goalMinutes,
        String intention
    ) {
        NotificationManager manager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Walk With Me",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Gentle accountability reminders you chose.");
            manager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("https://elroicall.com/app/walk/?checkin=1"));
        intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            4107,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String prefix = intention == null ? "" : intention.trim();
        String body = (prefix.isEmpty() ? "" : prefix + " ") +
            "You wanted to keep " + appLabel + " around " + goalMinutes +
            " minutes today. Want to switch gears?";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("A gentle check-in")
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW);

        manager.notify(NOTIFICATION_ID, builder.build());
    }
}
