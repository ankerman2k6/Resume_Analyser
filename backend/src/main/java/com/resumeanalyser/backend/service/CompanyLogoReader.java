package com.resumeanalyser.backend.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;

import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;

import org.springframework.web.multipart.MultipartFile;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.UnsupportedFileTypeException;
import com.resumeanalyser.backend.model.Company;

public final class CompanyLogoReader {
    private CompanyLogoReader() {}

    public static Company.Logo read(MultipartFile file) {
        if (file == null) return null;
        if (file.getSize() > 2L * 1024 * 1024) throw new BadRequestException("Logo tối đa 2 MB.");
        try {
            byte[] bytes = file.getBytes();
            try (var stream = new MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))) {
                var readers = ImageIO.getImageReaders(stream);
                if (!readers.hasNext()) throw invalidImage();
                var reader = readers.next();
                try {
                    String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                    if (!format.equals("png") && !format.equals("jpeg")) throw invalidImage();
                    reader.setInput(stream, true, true);
                    int width = reader.getWidth(0);
                    int height = reader.getHeight(0);
                    if ((long) width * height > 32_000_000L) throw new BadRequestException("Logo tối đa 32 megapixel.");
                    // Decode at thumbnail size to check image data without allocating a full camera photo.
                    var params = reader.getDefaultReadParam();
                    params.setSourceSubsampling(Math.max(1, width / 256), Math.max(1, height / 256), 0, 0);
                    reader.read(0, params);
                    return new Company.Logo("image/" + format, bytes);
                } finally {
                    reader.dispose();
                }
            }
        } catch (IOException ex) {
            throw invalidImage();
        }
    }

    private static UnsupportedFileTypeException invalidImage() {
        return new UnsupportedFileTypeException("Logo phải là ảnh PNG hoặc JPEG hợp lệ.");
    }
}
