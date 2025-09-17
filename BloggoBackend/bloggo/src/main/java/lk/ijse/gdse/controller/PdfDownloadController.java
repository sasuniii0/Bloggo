package lk.ijse.gdse.controller;

import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.service.PostService;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.jsoup.Jsoup;


@RestController
@RequestMapping("/api/v1/pdf")
@RequiredArgsConstructor
public class PdfDownloadController {

    private final PostService postService;

    @GetMapping("/download-pdf/{postId}")
    public ResponseEntity<byte[]> downloadPostPdf(@PathVariable Long postId) {
        try {
            // Fetch post from DB
            Post post = postService.getPostById(postId);

            // Parse HTML content to plain text
            String htmlContent = post.getContent();
            String textContent = Jsoup.parse(htmlContent).text(); // strips HTML tags

            // Create PDF in memory
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Add Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph(post.getTitle(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph("\n")); // blank line

            // Add Cleaned Content
            Font contentFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
            Paragraph content = new Paragraph(textContent, contentFont);
            document.add(content);

            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + post.getTitle() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
