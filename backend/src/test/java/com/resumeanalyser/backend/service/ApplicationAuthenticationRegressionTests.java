package com.resumeanalyser.backend.service;

import com.resumeanalyser.backend.controller.HrApplicationController;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.service.HrApplicationDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApplicationAuthenticationRegressionTests {
    @Test
    void controllerUsesUserIdInsteadOfPrincipalToString() {
        User user = new User();
        user.setId("6ac15217f84ca0e8c243b00e");
        var authentication = new UsernamePasswordAuthenticationToken(user, null,
                List.of(new SimpleGrantedAuthority("ROLE_RECRUITER")));
        assertEquals(user.toString(), authentication.getName());
        assertNotEquals(user.getId(), authentication.getName());
        var service = mock(ApplicationService.class);
        var details = mock(HrApplicationDetailsService.class);
        when(details.getByJob(user.getId(), user.getId())).thenReturn(List.of());
        var controller = new HrApplicationController(service, details);
        assertEquals(List.of(), controller.getApplications(user.getId(), authentication).getBody());
        verify(details).getByJob(user.getId(), user.getId());
    }
}
