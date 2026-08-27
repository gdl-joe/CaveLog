<?php
require_once __DIR__ . '/bootstrap.php';

/**
 * GrottoCenter-Anbindung — ENTFERNT am 2026-08-27.
 *
 * GrottoCenter hat beanstandet, dass diese Seite ihre Daten nutzt, ohne die
 * zugehörige Lizenz zu beachten, und um Einstellung gebeten. Daraufhin wurde
 * jede Verbindung zu deren Servern entfernt — nicht nur gesperrt.
 *
 * In dieser Datei steht bewusst kein Code mehr, der nach außen geht: kein
 * curl, keine Adresse, kein Abruf. Sie antwortet nur noch, damit ein alter
 * Aufruf aus einem zwischengespeicherten Browserstand eine verständliche
 * Meldung bekommt statt eines Serverfehlers.
 *
 * Der frühere Stand liegt unter archiv/grottocenter.php.stillgelegt-2026-08-27
 * und gehört NICHT auf den Server. Vor einer etwaigen Wiederaufnahme muss
 * geklärt sein, unter welcher Lizenz die Daten stehen und welche Auflagen sie
 * macht — insbesondere, wie die Namensnennung zu erfolgen hat.
 */

Response::error(
    'Die Anbindung an GrottoCenter wurde entfernt.',
    410            // Gone — dauerhaft weg, nicht bloß vorübergehend gestört
);
