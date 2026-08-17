<?php
declare(strict_types=1);

/**
 * Images — Ableitungen eines hochgeladenen Fotos.
 *
 * Drei Größen, jede für einen bestimmten Zweck:
 *   thumb  400px  Filmstreifen, kleine Vorschauen
 *   large 1200px  Kacheln und Karten im Raster
 *   full  2048px  Vollbild-Diashow unterhalb großer Fenster
 * Darüber zeigt die App die Originaldatei.
 *
 * Alle Grenzen beziehen sich auf die LÄNGERE Kante. Wichtig bei den hier
 * üblichen Panoramen (Seitenverhältnis bis 2,2:1): Die kürzere Kante fällt
 * dadurch klein aus — deshalb existiert `full` überhaupt.
 */
class Images
{
    public const SIZES = [
        'thumb' => 400,
        'large' => 1200,
        'full'  => 2048,
    ];

    /** JPEG-Qualität je Größe — kleine Bilder vertragen mehr Kompression. */
    private const QUALITY = ['thumb' => 80, 'large' => 84, 'full' => 84];

    /**
     * Alle fehlenden Ableitungen zu einer Bilddatei erzeugen.
     *
     * @param string $sourceAbs Absoluter Pfad zur Originaldatei
     * @return array{width:int, height:int, created:array<string,bool>}|null
     *         null, wenn die Datei nicht als Bild lesbar ist
     */
    public static function derive(string $sourceAbs, bool $overwrite = false): ?array
    {
        if (!is_file($sourceAbs) || !extension_loaded('gd')) return null;

        $info = @getimagesize($sourceAbs);
        if (!$info) return null;
        [$w, $h] = $info;

        $src = match ($info['mime'] ?? '') {
            'image/jpeg' => @imagecreatefromjpeg($sourceAbs),
            'image/png'  => @imagecreatefrompng($sourceAbs),
            default      => false,
        };
        if (!$src) return null;

        $dir     = dirname($sourceAbs);
        $name    = basename($sourceAbs);
        $created = [];

        foreach (self::SIZES as $key => $max) {
            $target = $dir . '/' . $key . '_' . $name;
            if (!$overwrite && is_file($target)) { $created[$key] = true; continue; }
            $created[$key] = self::resize($src, $w, $h, $max, $target, self::QUALITY[$key]);
        }

        imagedestroy($src);
        return ['width' => $w, 'height' => $h, 'created' => $created];
    }

    /**
     * Verkleinern und speichern. Gibt false zurück, wenn das Original bereits
     * klein genug ist — dann wird bewusst keine Datei angelegt und die App
     * greift auf das Original zurück.
     */
    private static function resize($src, int $w, int $h, int $max, string $dest, int $quality): bool
    {
        if ($w <= $max && $h <= $max) return false;

        $ratio = $max / max($w, $h);
        $nw = max(1, (int)round($w * $ratio));
        $nh = max(1, (int)round($h * $ratio));

        $dst = imagecreatetruecolor($nw, $nh);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

        // Nachschärfen nur bei kräftiger Verkleinerung. Höhlenfotos sind dunkel
        // und rauschen; eine Schärfung hebt das Rauschen mit an und bläht die
        // Datei um rund die Hälfte auf. Ab Faktor 2 wiegt der Detailgewinn das auf.
        if (max($w, $h) / $max >= 2.0) self::sharpen($dst);

        imageinterlace($dst, true);            // progressiv — baut sich beim Laden früher auf
        $ok = imagejpeg($dst, $dest, $quality);
        imagedestroy($dst);

        return (bool)$ok;
    }

    /** Dezente Unschärfemaske; bei sehr kleinen Bildern übersprungen. */
    private static function sharpen($img): void
    {
        if (imagesx($img) < 200 || imagesy($img) < 200) return;
        // Kreuzförmig: Mitte = 1 + Summe der Nachbarn (4 × 0,25),
        // Divisor 1,0 hält die Gesamthelligkeit konstant.
        $kernel = [
            [ 0.00, -0.25,  0.00],
            [-0.25,  2.00, -0.25],
            [ 0.00, -0.25,  0.00],
        ];
        @imageconvolution($img, $kernel, 1.0, 0);
    }

    /**
     * Relativer DB-Pfad (/uploads/...) → absoluter Pfad im Dateisystem.
     *
     * Der Ausbruchschutz prüft ausschließlich den aus der Datenbank stammenden
     * Teil. Der konfigurierte Basispfad darf sehr wohl „..“ enthalten — er wird
     * in config.php üblicherweise als `__DIR__ . '/../uploads'` gesetzt.
     */
    public static function toAbsolute(string $relPath, string $uploadDir): ?string
    {
        $rel = ltrim($relPath, '/');
        if (!str_starts_with($rel, 'uploads/')) return null;

        $tail = substr($rel, strlen('uploads/'));
        if ($tail === '' || str_contains($tail, '..') || str_contains($tail, "\0")) return null;

        return rtrim($uploadDir, '/') . '/' . $tail;
    }

    /** Aus /uploads/a/b/foto.jpg wird /uploads/a/b/full_foto.jpg */
    public static function variantPath(string $relPath, string $variant): string
    {
        $dir  = dirname($relPath);
        $name = basename($relPath);
        return ($dir === '.' ? '' : $dir) . '/' . $variant . '_' . $name;
    }
}
