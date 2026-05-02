package com.renewly.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;

final class ReminderScheduler {
    static final String CHANNEL_ID = "renewly_reminders";
    static final String EXTRA_TITLE = "title";
    static final String EXTRA_BODY = "body";

    private static final String PREFS_NAME = "renewly_native";
    private static final String RECORDS_JSON = "records_json";
    private static final int[] REMINDER_DAYS = {90, 30, 7, 1};

    private ReminderScheduler() {
    }

    static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) return;

        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Renewly reminders",
                NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Renewal, warranty, and service reminder alerts");
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    static void scheduleFromJson(Context context, String recordsJson) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(RECORDS_JSON, recordsJson)
                .apply();

        createNotificationChannel(context);
        cancelKnownAlarms(context);

        try {
            JSONArray records = new JSONArray(recordsJson);
            Set<String> alarmIds = new HashSet<>();
            for (int index = 0; index < records.length(); index++) {
                JSONObject record = records.getJSONObject(index);
                if (record.optBoolean("archived")) continue;
                String lifecycle = record.optString("lifecycle", "Active");
                if ("Sold".equals(lifecycle) || "Replaced".equals(lifecycle)) continue;

                String expiryDate = record.optString("expiryDate", "");
                if (expiryDate.length() == 0) continue;

                for (int daysBefore : REMINDER_DAYS) {
                    scheduleRecordReminder(context, record, daysBefore, alarmIds);
                }
            }
            saveAlarmIds(context, alarmIds);
        } catch (JSONException ignored) {
            // Bad local data should not break the app. The web layer remains source of truth.
        }
    }

    static void rescheduleSaved(Context context) {
        String recordsJson = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(RECORDS_JSON, "[]");
        scheduleFromJson(context, recordsJson);
    }

    static void showNow(Context context, String title, String body) {
        createNotificationChannel(context);
        if (!canNotify(context)) return;

        NotificationReceiver.showNotification(context, title, body, 9001);
    }

    private static void scheduleRecordReminder(
            Context context,
            JSONObject record,
            int daysBefore,
            Set<String> alarmIds
    ) {
        String id = record.optString("id", record.optString("title", "record"));
        String title = record.optString("title", "Renewly reminder");
        String type = record.optString("type", "Reminder");
        String expiryDate = record.optString("expiryDate", "");
        String alarmId = id + "_" + daysBefore;

        LocalDate reminderDate;
        try {
            reminderDate = LocalDate.parse(expiryDate).minusDays(daysBefore);
        } catch (Exception exception) {
            return;
        }

        long triggerAt = reminderDate
                .atTime(9, 0)
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
        if (triggerAt <= System.currentTimeMillis()) return;

        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_BODY, type + " due on " + expiryDate + " (" + daysBefore + " days before)");
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                Math.abs(alarmId.hashCode()),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;
        alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        alarmIds.add(alarmId);
    }

    private static boolean canNotify(Context context) {
        return Build.VERSION.SDK_INT < 33
                || context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private static void cancelKnownAlarms(Context context) {
        Set<String> alarmIds = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getStringSet("alarm_ids", new HashSet<>());
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        for (String alarmId : alarmIds) {
            Intent intent = new Intent(context, NotificationReceiver.class);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    Math.abs(alarmId.hashCode()),
                    intent,
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
            );
            if (pendingIntent != null) {
                alarmManager.cancel(pendingIntent);
            }
        }
    }

    private static void saveAlarmIds(Context context, Set<String> alarmIds) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putStringSet("alarm_ids", alarmIds)
                .apply();
    }
}
