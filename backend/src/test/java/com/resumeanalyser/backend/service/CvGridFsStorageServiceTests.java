package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.InputStream;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.resumeanalyser.backend.exception.FileStorageException;
import com.resumeanalyser.backend.exception.NotFoundException;

@ExtendWith(MockitoExtension.class)
class CvGridFsStorageServiceTests {

    @Mock
    GridFsTemplate gridFsTemplate;

    CvGridFsStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new CvGridFsStorageService(gridFsTemplate);
    }

    @Test
    void storePdf_storesWithMetadataAndReturnsObjectId() {
        ObjectId fileId = new ObjectId();
        ObjectId candidateId = new ObjectId();
        ObjectId templateId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), eq("cv.pdf"), eq("application/pdf"), any(Document.class)))
                .thenReturn(fileId);

        ObjectId stored = storageService.storePdf("%PDF-1.4".getBytes(), "cv.pdf", candidateId, templateId);
        assertEquals(fileId, stored);
    }

    @Test
    void storePdf_wrapsMongoFailureIn502FileStorageException() {
        when(gridFsTemplate.store(any(InputStream.class), any(), any(), any(Document.class)))
                .thenThrow(new DataAccessResourceFailureException("Mongo down"));

        FileStorageException ex = assertThrows(FileStorageException.class,
                () -> storageService.storePdf("%PDF-1.4".getBytes(), "cv.pdf", new ObjectId(), new ObjectId()));
        assertEquals("FILE_STORAGE_UNAVAILABLE", ex.getCode());
    }

    @Test
    void getPdfResource_returnsResourceWhenPresentAndThrows404WhenMissing() {
        ObjectId fileId = new ObjectId();
        GridFSFile gridFsFile = mock(GridFSFile.class);
        GridFsResource resource = mock(GridFsResource.class);
        when(gridFsTemplate.findOne(any(Query.class))).thenReturn(gridFsFile);
        when(gridFsTemplate.getResource(gridFsFile)).thenReturn(resource);
        when(resource.exists()).thenReturn(true);

        assertEquals(resource, storageService.getPdfResource(fileId));

        ObjectId missingId = new ObjectId();
        when(gridFsTemplate.findOne(any(Query.class))).thenReturn(null);
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> storageService.getPdfResource(missingId));
        assertEquals("CV_FILE_NOT_FOUND", ex.getCode());
    }

    @Test
    void delete_callsGridFsDeleteAndDeleteQuietlySwallowsErrors() {
        ObjectId fileId = new ObjectId();
        storageService.delete(fileId);
        verify(gridFsTemplate).delete(any(Query.class));

        doThrow(new DataAccessResourceFailureException("Mongo down"))
                .when(gridFsTemplate).delete(any(Query.class));
        assertThrows(FileStorageException.class, () -> storageService.delete(fileId));
        assertDoesNotThrow(() -> storageService.deleteQuietly(fileId));
    }
}
