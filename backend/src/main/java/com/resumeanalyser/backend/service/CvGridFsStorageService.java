package com.resumeanalyser.backend.service;

import java.io.ByteArrayInputStream;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;

import com.mongodb.MongoException;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.resumeanalyser.backend.exception.FileStorageException;
import com.resumeanalyser.backend.exception.NotFoundException;

@Service
public class CvGridFsStorageService {

    private static final Logger log = LoggerFactory.getLogger(CvGridFsStorageService.class);
    private static final String PDF_MIME_TYPE = "application/pdf";

    private final GridFsTemplate gridFsTemplate;

    public CvGridFsStorageService(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }

    public ObjectId storePdf(byte[] pdfBytes, String fileName, ObjectId candidateId, ObjectId templateId) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "Dữ liệu PDF trống, không thể lưu trữ.");
        }
        Document metadata = new Document();
        if (candidateId != null) {
            metadata.put("candidateId", candidateId);
        }
        if (templateId != null) {
            metadata.put("templateId", templateId);
        }
        metadata.put("mimeType", PDF_MIME_TYPE);

        try {
            return gridFsTemplate.store(
                    new ByteArrayInputStream(pdfBytes),
                    fileName,
                    PDF_MIME_TYPE,
                    metadata
            );
        } catch (DataAccessException | MongoException ex) {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "Không thể lưu tệp PDF vào GridFS.");
        }
    }

    public Resource getPdfResource(ObjectId fileId) {
        if (fileId == null) {
            throw new NotFoundException("CV_FILE_NOT_FOUND", "Không tìm thấy tệp CV trong GridFS.");
        }
        try {
            GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(fileId)));
            if (file == null) {
                throw new NotFoundException("CV_FILE_NOT_FOUND", "Không tìm thấy tệp CV trong GridFS.");
            }
            GridFsResource resource = gridFsTemplate.getResource(file);
            if (!resource.exists()) {
                throw new NotFoundException("CV_FILE_NOT_FOUND", "Không tìm thấy tệp CV trong GridFS.");
            }
            return resource;
        } catch (NotFoundException ex) {
            throw ex;
        } catch (DataAccessException | MongoException ex) {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "Không thể đọc tệp PDF từ GridFS.");
        }
    }

    public void delete(ObjectId fileId) {
        if (fileId == null) {
            return;
        }
        try {
            gridFsTemplate.delete(Query.query(Criteria.where("_id").is(fileId)));
        } catch (DataAccessException | MongoException ex) {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "Không thể xóa tệp PDF từ GridFS.");
        }
    }

    public void deleteQuietly(ObjectId fileId) {
        if (fileId == null) {
            return;
        }
        try {
            gridFsTemplate.delete(Query.query(Criteria.where("_id").is(fileId)));
        } catch (RuntimeException ex) {
            log.warn("Không thể dọn tệp GridFS {} sau khi rollback lưu CV", fileId, ex);
        }
    }
}
