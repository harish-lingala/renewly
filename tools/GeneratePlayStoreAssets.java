import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import javax.imageio.ImageIO;

public class GeneratePlayStoreAssets {
    private static final Color BRAND = new Color(31, 95, 191);
    private static final Color BRAND_DARK = new Color(18, 63, 145);
    private static final Color FRESH = new Color(67, 183, 42);
    private static final Color DANGER = new Color(239, 75, 93);
    private static final Color INK = new Color(31, 41, 51);
    private static final Color MUTED = new Color(95, 111, 125);
    private static final Color LINE = new Color(216, 229, 239);
    private static final Color SURFACE = new Color(248, 251, 253);
    private static final Color SOFT_BLUE = new Color(234, 244, 255);
    private static final Color SOFT_GREEN = new Color(233, 248, 230);

    public static void main(String[] args) throws Exception {
        File out = new File("playstore/assets");
        new File(out, "phone").mkdirs();
        new File(out, "tablet-7").mkdirs();
        new File(out, "tablet-10").mkdirs();

        write(drawIcon(), new File(out, "renewly-icon-512.png"));
        write(drawFeature(), new File(out, "renewly-feature-1024x500.png"));

        String[] screens = {"Home", "Record Detail", "Calendar", "Documents"};
        for (int i = 0; i < screens.length; i++) {
            write(drawScreenshot(1080, 1920, screens[i], false), new File(out, "phone/renewly-phone-" + (i + 1) + ".png"));
            write(drawScreenshot(1200, 1920, screens[i], true), new File(out, "tablet-7/renewly-7in-" + (i + 1) + ".png"));
            write(drawScreenshot(1600, 2560, screens[i], true), new File(out, "tablet-10/renewly-10in-" + (i + 1) + ".png"));
        }
    }

    private static BufferedImage drawIcon() {
        BufferedImage img = canvas(512, 512);
        Graphics2D g = img.createGraphics();
        quality(g);
        GradientPaint bg = new GradientPaint(0, 0, BRAND, 512, 512, FRESH);
        g.setPaint(bg);
        round(g, 40, 40, 432, 432, 108, null);
        g.setColor(new Color(255, 255, 255, 235));
        round(g, 118, 96, 276, 320, 44, null);
        g.setColor(BRAND_DARK);
        g.fillRoundRect(150, 150, 212, 174, 30, 30);
        g.setColor(Color.WHITE);
        g.fillRoundRect(178, 190, 156, 70, 18, 18);
        g.setColor(FRESH);
        g.fillOval(303, 282, 88, 88);
        g.setStroke(new BasicStroke(18, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.setColor(Color.WHITE);
        g.drawLine(324, 327, 344, 347);
        g.drawLine(344, 347, 374, 309);
        g.setColor(BRAND_DARK);
        g.fillOval(190, 340, 30, 30);
        g.fillOval(292, 340, 30, 30);
        g.dispose();
        return img;
    }

    private static BufferedImage drawFeature() {
        BufferedImage img = canvas(1024, 500);
        Graphics2D g = img.createGraphics();
        quality(g);
        g.setPaint(new GradientPaint(0, 0, new Color(232, 244, 255), 1024, 500, new Color(236, 250, 232)));
        g.fillRect(0, 0, 1024, 500);
        g.setColor(new Color(255, 255, 255, 220));
        round(g, 56, 62, 912, 376, 32, null);
        g.setColor(BRAND_DARK);
        text(g, "Renewly", 84, 150, 58, true);
        text(g, "Policy & Warranty Reminders", 88, 206, 28, false);
        g.setColor(INK);
        text(g, "Never miss vehicle, gadget, insurance,", 88, 278, 30, false);
        text(g, "warranty, or service expiry dates.", 88, 322, 30, false);
        badge(g, 88, 362, 190, 48, "Reminders", BRAND);
        badge(g, 298, 362, 180, 48, "Documents", FRESH);
        drawPhoneMock(g, 682, 56, 230, 388);
        g.dispose();
        return img;
    }

    private static BufferedImage drawScreenshot(int w, int h, String screen, boolean tablet) {
        BufferedImage img = canvas(w, h);
        Graphics2D g = img.createGraphics();
        quality(g);
        g.setColor(SURFACE);
        g.fillRect(0, 0, w, h);

        int margin = tablet ? w / 12 : 54;
        int top = tablet ? 70 : 62;
        int contentW = w - margin * 2;

        header(g, w, margin, top, screen.equals("Home") ? "Renewly" : screen);
        int y = top + (tablet ? 150 : 132);
        if (screen.equals("Home")) home(g, margin, y, contentW, tablet);
        if (screen.equals("Record Detail")) detail(g, margin, y, contentW, tablet);
        if (screen.equals("Calendar")) calendar(g, margin, y, contentW, tablet);
        if (screen.equals("Documents")) documents(g, margin, y, contentW, tablet);
        nav(g, w, h, screen);
        g.dispose();
        return img;
    }

    private static void header(Graphics2D g, int w, int margin, int top, String title) {
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, w, top + 96);
        g.setColor(new Color(226, 237, 246));
        g.drawLine(0, top + 96, w, top + 96);
        g.setColor(INK);
        text(g, "☰", margin, top + 38, 42, false);
        g.setColor(BRAND_DARK);
        center(g, title, w / 2, top + 28, 44, true);
        if (title.equals("Renewly")) center(g, "Policy & Warranty Reminders", w / 2, top + 72, 20, true);
        g.setColor(INK);
        text(g, "⌕", w - margin - 112, top + 38, 42, false);
        text(g, "●", w - margin - 34, top + 38, 34, false);
    }

    private static void home(Graphics2D g, int x, int y, int w, boolean tablet) {
        card(g, x, y, w, tablet ? 230 : 310, SOFT_BLUE);
        g.setColor(BRAND);
        text(g, "WELCOME", x + 44, y + 58, 24, true);
        g.setColor(INK);
        text(g, "Welcome to Renewly", x + 44, y + 118, 42, true);
        g.setColor(MUTED);
        text(g, "Track vehicle and gadget renewals in one calm place.", x + 44, y + 182, 30, false);
        g.setColor(BRAND);
        g.fillRoundRect(x + w - 110, y + (tablet ? 172 : 246), 56, 16, 12, 12);
        g.setColor(new Color(198, 218, 232));
        g.fillOval(x + w - 42, y + (tablet ? 172 : 246), 18, 18);

        int rowY = y + (tablet ? 285 : 380);
        text(g, "Overview", x, rowY, 34, true);
        text(g, "Today, 1 May", x + w - 220, rowY, 26, false);
        int gap = 24;
        int boxW = (w - gap * 3) / 4;
        stat(g, x, rowY + 38, boxW, "2", "Upcoming", BRAND);
        stat(g, x + (boxW + gap), rowY + 38, boxW, "1", "Due This Week", FRESH);
        stat(g, x + (boxW + gap) * 2, rowY + 38, boxW, "0", "Overdue", DANGER);
        stat(g, x + (boxW + gap) * 3, rowY + 38, boxW, "0", "Service Due", BRAND);

        int listY = rowY + 235;
        section(g, x, listY, w, "Upcoming & Due");
        record(g, x, listY + 58, w, "iPhone Warranty", "Apple Store  Spouse", "04 May 2026   3 days left", "Due This Week", FRESH, DANGER, false);
        record(g, x, listY + 238, w, "Scooter PUC", "Local emission center  Shared", "15 May 2026   14 days left", "Expiring Soon", BRAND, DANGER, true);
        section(g, x, listY + 455, w, "Service Reminders");
        record(g, x, listY + 513, w, "AC Service Contract", "Urban Company  Shared", "10 Jul 2026   70 days left", "Active", FRESH, new Color(22, 135, 100), false);
    }

    private static void detail(Graphics2D g, int x, int y, int w, boolean tablet) {
        card(g, x, y, w, 300, Color.WHITE);
        icon(g, x + 34, y + 34, 118, BRAND, true);
        g.setColor(INK);
        text(g, "Honda City Insurance", x + 184, y + 80, 38, true);
        g.setColor(MUTED);
        text(g, "Honda City • Self", x + 184, y + 126, 26, false);
        text(g, "Policy No. IC1234567890", x + 184, y + 170, 25, false);
        badge(g, x + w - 178, y + 54, 128, 46, "Active", new Color(22, 135, 100));
        int infoY = y + 340;
        info(g, x, infoY, w, "Provider", "HDFC ERGO General", "Policy Type", "Comprehensive");
        info(g, x, infoY + 150, w, "Start Date", "01 Aug 2025", "Expiry Date", "31 Jul 2026");
        info(g, x, infoY + 300, w, "Premium", "₹12,450", "IDV", "₹6,20,000");
        section(g, x, infoY + 505, w, "Documents");
        docRow(g, x, infoY + 570, w, "Policy Document", "01 Aug 2025 • PDF • 248 KB");
        section(g, x, infoY + 740, w, "Renewal History");
        history(g, x, infoY + 805, w, "01 Aug 2025 - 31 Jul 2026", "HDFC ERGO General Insurance", "₹12,450", true);
        history(g, x, infoY + 940, w, "01 Aug 2024 - 31 Jul 2025", "HDFC ERGO General Insurance", "₹11,380", true);
    }

    private static void calendar(Graphics2D g, int x, int y, int w, boolean tablet) {
        card(g, x, y, w, 660, Color.WHITE);
        center(g, "May 2026", x + w / 2, y + 68, 34, true);
        int gridX = x + 44;
        int gridY = y + 125;
        int cell = (w - 88) / 7;
        String[] days = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        for (int i = 0; i < 7; i++) center(g, days[i], gridX + i * cell + cell / 2, gridY, 20, false);
        int d = 1;
        for (int r = 0; r < 5; r++) {
            for (int c = 0; c < 7; c++) {
                int cx = gridX + c * cell + cell / 2;
                int cy = gridY + 62 + r * 92;
                if (r == 0 && c < 5) continue;
                Color mark = d == 5 ? new Color(212, 119, 8) : d == 10 ? DANGER : d == 18 ? FRESH : null;
                if (mark != null) {
                    g.setColor(mark);
                    g.fillOval(cx - 28, cy - 36, 56, 56);
                    g.setColor(Color.WHITE);
                } else {
                    g.setColor(INK);
                }
                center(g, String.valueOf(d), cx, cy, 24, mark != null);
                d++;
                if (d > 31) break;
            }
        }
        section(g, x, y + 730, w, "May 2026");
        event(g, x, y + 795, w, "05", "Car Service", "Honda City • Self", "Service Due");
        event(g, x, y + 955, w, "10", "Scooter PUC", "Activa 6G • Self", "Due This Week");
        event(g, x, y + 1115, w, "18", "Mobile Warranty", "Samsung Galaxy S23 • Self", "Upcoming");
    }

    private static void documents(Graphics2D g, int x, int y, int w, boolean tablet) {
        tab(g, x, y, w);
        int start = y + 120;
        docGroup(g, x, start, w, "Honda City", "3 Documents", BRAND);
        docRow(g, x + 24, start + 112, w - 48, "Car Insurance Policy", "01 Aug 2025 • PDF • 248 KB");
        docRow(g, x + 24, start + 262, w - 48, "Previous Year Policy", "01 Aug 2024 • PDF • 220 KB");
        docGroup(g, x, start + 455, w, "Samsung Galaxy S23", "2 Documents", FRESH);
        docRow(g, x + 24, start + 567, w - 48, "Warranty Card", "18 Jun 2025 • PDF • 186 KB");
        docRow(g, x + 24, start + 717, w - 48, "Purchase Bill", "18 Jun 2025 • JPG • 1.2 MB");
    }

    private static void drawPhoneMock(Graphics2D g, int x, int y, int w, int h) {
        g.setColor(new Color(20, 32, 42));
        g.fillRoundRect(x, y, w, h, 42, 42);
        g.setColor(Color.WHITE);
        g.fillRoundRect(x + 12, y + 12, w - 24, h - 24, 32, 32);
        g.setColor(BRAND_DARK);
        center(g, "Renewly", x + w / 2, y + 62, 24, true);
        g.setColor(SOFT_BLUE);
        g.fillRoundRect(x + 30, y + 100, 54, 96, 12, 12);
        g.fillRoundRect(x + 92, y + 100, 54, 96, 12, 12);
        g.fillRoundRect(x + 154, y + 100, 54, 96, 12, 12);
        g.setColor(BRAND);
        center(g, "3", x + 57, y + 134, 28, true);
        g.setColor(FRESH);
        center(g, "1", x + 119, y + 134, 28, true);
        g.setColor(DANGER);
        center(g, "0", x + 181, y + 134, 28, true);

        miniRecord(g, x + 28, y + 225, w - 56, BRAND, "Car Insurance", "15 May");
        miniRecord(g, x + 28, y + 325, w - 56, FRESH, "Phone", "30 Jul");
    }

    private static void miniRecord(Graphics2D g, int x, int y, int w, Color color, String title, String date) {
        g.setColor(new Color(248, 251, 253));
        g.fillRoundRect(x, y, w, 78, 14, 14);
        g.setColor(LINE);
        g.drawRoundRect(x, y, w, 78, 14, 14);
        g.setColor(color);
        g.fillRoundRect(x + 14, y + 16, 44, 44, 10, 10);
        g.setColor(INK);
        text(g, title, x + 74, y + 34, 16, true);
        g.setColor(MUTED);
        text(g, date, x + 74, y + 58, 15, false);
    }

    private static void section(Graphics2D g, int x, int y, int w, String title) {
        g.setColor(INK);
        text(g, title, x, y, 34, true);
        badge(g, x + w - 160, y - 36, 160, 54, "View all", SOFT_BLUE, BRAND_DARK);
    }

    private static void record(Graphics2D g, int x, int y, int w, String title, String meta, String date, String status, Color iconColor, Color statusColor, boolean auto) {
        card(g, x, y, w, 150, Color.WHITE);
        icon(g, x + 36, y + 36, 78, iconColor, auto);
        g.setColor(INK);
        text(g, title, x + 138, y + 60, 28, true);
        g.setColor(MUTED);
        text(g, meta, x + 138, y + 96, 22, false);
        text(g, date, x + 138, y + 128, 22, false);
        badge(g, x + w - 260, y + 52, 210, 52, status, statusColor);
    }

    private static void stat(Graphics2D g, int x, int y, int w, String num, String label, Color color) {
        card(g, x, y, w, 145, Color.WHITE);
        g.setColor(color);
        text(g, num, x + 28, y + 52, 38, true);
        g.setColor(MUTED);
        text(g, label, x + 28, y + 100, 22, false);
    }

    private static void icon(Graphics2D g, int x, int y, int size, Color color, boolean auto) {
        g.setColor(color);
        g.fillRoundRect(x, y, size, size, 18, 18);
        g.setColor(Color.WHITE);
        g.setStroke(new BasicStroke(Math.max(4, size / 16), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        if (auto) {
            g.drawRoundRect(x + size / 5, y + size / 3, size * 3 / 5, size / 3, 8, 8);
            g.drawLine(x + size / 3, y + size / 3, x + size * 2 / 5, y + size / 5);
            g.drawLine(x + size * 3 / 5, y + size / 5, x + size * 2 / 3, y + size / 3);
            g.fillOval(x + size / 4, y + size * 2 / 3, size / 8, size / 8);
            g.fillOval(x + size * 5 / 8, y + size * 2 / 3, size / 8, size / 8);
        } else {
            g.drawRoundRect(x + size / 3, y + size / 5, size / 3, size * 3 / 5, 8, 8);
            g.drawLine(x + size / 2, y + size * 4 / 5, x + size / 2, y + size * 4 / 5);
        }
    }

    private static void info(Graphics2D g, int x, int y, int w, String l1, String v1, String l2, String v2) {
        int half = (w - 20) / 2;
        detailBox(g, x, y, half, l1, v1);
        detailBox(g, x + half + 20, y, half, l2, v2);
    }

    private static void detailBox(Graphics2D g, int x, int y, int w, String label, String value) {
        card(g, x, y, w, 120, new Color(244, 248, 251));
        g.setColor(MUTED);
        text(g, label, x + 28, y + 38, 20, true);
        g.setColor(INK);
        text(g, value, x + 28, y + 82, 25, true);
    }

    private static void docRow(Graphics2D g, int x, int y, int w, String title, String sub) {
        card(g, x, y, w, 125, Color.WHITE);
        g.setColor(new Color(244, 248, 251));
        g.fillRoundRect(x + 28, y + 22, 82, 82, 12, 12);
        g.setColor(DANGER);
        center(g, "PDF", x + 69, y + 70, 20, true);
        g.setColor(INK);
        text(g, title, x + 140, y + 54, 26, true);
        g.setColor(MUTED);
        text(g, sub, x + 140, y + 90, 22, false);
        g.setColor(MUTED);
        text(g, "⋮", x + w - 52, y + 70, 28, true);
    }

    private static void history(Graphics2D g, int x, int y, int w, String title, String sub, String amount, boolean done) {
        card(g, x, y, w, 112, Color.WHITE);
        g.setColor(done ? new Color(22, 135, 100) : Color.WHITE);
        g.fillOval(x + 28, y + 38, 36, 36);
        g.setColor(INK);
        text(g, title, x + 88, y + 44, 23, false);
        g.setColor(MUTED);
        text(g, sub, x + 88, y + 78, 21, false);
        g.setColor(INK);
        text(g, amount, x + w - 150, y + 60, 22, false);
    }

    private static void event(Graphics2D g, int x, int y, int w, String day, String title, String sub, String status) {
        card(g, x, y, w, 130, Color.WHITE);
        g.setColor(SOFT_BLUE);
        g.fillRoundRect(x + 26, y + 24, 82, 82, 12, 12);
        g.setColor(BRAND_DARK);
        center(g, day, x + 67, y + 66, 34, true);
        g.setColor(INK);
        text(g, title, x + 138, y + 52, 26, true);
        g.setColor(MUTED);
        text(g, sub, x + 138, y + 88, 22, false);
        badge(g, x + w - 220, y + 40, 170, 48, status, status.equals("Upcoming") ? FRESH : DANGER);
    }

    private static void docGroup(Graphics2D g, int x, int y, int w, String title, String count, Color color) {
        card(g, x, y, w, 104, Color.WHITE);
        icon(g, x + 28, y + 24, 58, color, color.equals(BRAND));
        g.setColor(INK);
        text(g, title, x + 110, y + 50, 28, true);
        g.setColor(MUTED);
        text(g, count, x + 110, y + 82, 22, false);
        g.setColor(INK);
        text(g, "⌄", x + w - 60, y + 62, 28, true);
    }

    private static void tab(Graphics2D g, int x, int y, int w) {
        String[] tabs = {"All", "Automobiles", "Electronics"};
        int tabW = w / 3;
        for (int i = 0; i < 3; i++) {
            g.setColor(i == 0 ? BRAND_DARK : MUTED);
            center(g, tabs[i], x + i * tabW + tabW / 2, y + 35, 25, true);
        }
        g.setColor(BRAND);
        g.fillRoundRect(x, y + 62, tabW, 5, 5, 5);
    }

    private static void nav(Graphics2D g, int w, int h, String active) {
        int y = h - 160;
        g.setColor(Color.WHITE);
        g.fillRect(0, y, w, 160);
        g.setColor(LINE);
        g.drawLine(0, y, w, y);
        String[] labels = {"Home", "Records", "Calendar", "Docs"};
        for (int i = 0; i < labels.length; i++) {
            int cx = (w / 8) + i * (w / 4);
            boolean on = active.equals("Home") && i == 0 || active.equals("Record Detail") && i == 1 || active.equals("Calendar") && i == 2 || active.equals("Documents") && i == 3;
            g.setColor(on ? BRAND : MUTED);
            center(g, i == 0 ? "⌂" : i == 1 ? "▣" : i == 2 ? "▦" : "◧", cx, y + 54, 32, true);
            center(g, labels[i], cx, y + 106, 22, true);
        }
    }

    private static BufferedImage canvas(int w, int h) {
        return new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
    }

    private static void quality(Graphics2D g) {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    }

    private static void card(Graphics2D g, int x, int y, int w, int h, Color fill) {
        round(g, x, y, w, h, 18, fill);
        g.setColor(LINE);
        g.setStroke(new BasicStroke(2));
        g.drawRoundRect(x, y, w, h, 18, 18);
    }

    private static void badge(Graphics2D g, int x, int y, int w, int h, String label, Color color) {
        badge(g, x, y, w, h, label, color, Color.WHITE);
    }

    private static void badge(Graphics2D g, int x, int y, int w, int h, String label, Color bg, Color fg) {
        g.setColor(bg);
        g.fillRoundRect(x, y, w, h, h, h);
        g.setColor(fg);
        center(g, label, x + w / 2, y + h / 2 + 8, Math.max(18, h / 2), true);
    }

    private static void round(Graphics2D g, int x, int y, int w, int h, int arc, Color fill) {
        if (fill != null) g.setColor(fill);
        g.fill(new RoundRectangle2D.Float(x, y, w, h, arc, arc));
    }

    private static void text(Graphics2D g, String value, int x, int y, int size, boolean bold) {
        g.setFont(new Font("SansSerif", bold ? Font.BOLD : Font.PLAIN, size));
        g.drawString(value, x, y);
    }

    private static void center(Graphics2D g, String value, int x, int y, int size, boolean bold) {
        g.setFont(new Font("SansSerif", bold ? Font.BOLD : Font.PLAIN, size));
        FontMetrics fm = g.getFontMetrics();
        g.drawString(value, x - fm.stringWidth(value) / 2, y + (fm.getAscent() - fm.getDescent()) / 2);
    }

    private static void write(BufferedImage img, File file) throws Exception {
        file.getParentFile().mkdirs();
        ImageIO.write(img, "png", file);
    }
}
