from src.core.exceptions.app_exceptions import AppException


class ServiceException(AppException):
    """Ошибки бизнес-логики сервисов"""
    ...

class LinkServiceError(ServiceException):
    """Базовое исключение для сервиса ссылок"""
    ...
