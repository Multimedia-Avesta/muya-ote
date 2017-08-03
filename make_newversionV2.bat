@ECHO OFF
IF [%1]==[] (
	ECHO Geben Sie einen Dateinamen an, unter dem die Version abgespeichert werden soll
) ELSE "c:\program files\7-zip\7z" a -tzip -mx9 muya_%1.zip COPYING COPYING.LESSER Gruntfile.js LICENSE.TXT README TEI-NTMSS.xsd changelog.txt content-extra.css index.jsp package.json readme.md js\ tools\ wce-ote\
