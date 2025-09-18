package lk.ijse.gdse.exception;

import lk.ijse.gdse.dto.ApiResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO> handleGenericException(Exception e){
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        500,
                        e.getMessage(),
                        null
                ), HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponseDTO> handleResourceNotFoundException(ResourceNotFoundException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(404, e.getMessage(), null),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ResourceAlreadyFoundException.class)
    public ResponseEntity<ApiResponseDTO> handleResourceAlreadyFoundException(ResourceAlreadyFoundException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(409, e.getMessage(), null),
                HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(ResourseEmptyException.class)
    public ResponseEntity<ApiResponseDTO> handleResourceEmptyException(ResourseEmptyException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(204, e.getMessage(), null),
                HttpStatus.NO_CONTENT
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponseDTO> handleIllegalArgumentException(IllegalArgumentException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(400, e.getMessage(), null),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ApiResponseDTO> handleNullPointerException(NullPointerException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(500, "Null pointer exception occurred", null),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDTO> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return new ResponseEntity<>(
                new ApiResponseDTO(400, errors.toString(), null),
                HttpStatus.BAD_REQUEST
        );
    }


    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponseDTO> handleUserNotFoundException(UserNotFoundException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(404, e.getMessage(), null),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(AdminNotFoundException.class)
    public ResponseEntity<ApiResponseDTO> handleAdminNotFoundException(AdminNotFoundException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(404, e.getMessage(), null),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ActionNotFoundException.class)
    public ResponseEntity<ApiResponseDTO> handleActionNotFoundException(ActionNotFoundException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(404, e.getMessage(), null),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(InvalidActionException.class)
    public ResponseEntity<ApiResponseDTO> handleInvalidActionException(InvalidActionException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(400, e.getMessage(), null),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponseDTO> handleInvalidCredentialsException(InvalidCredentialsException e) {
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        401,
                        e.getMessage(),
                        null
                ),HttpStatus.UNAUTHORIZED
        );
    }
}
