class AppException(Exception):
    """Базовое исключение для всего приложения"""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message
    status_code = 500

class DatabaseConnectionError(AppException):
    """Ошибка подключения к БД"""
    status_code = 500
    