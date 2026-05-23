import os
import logging
from django.utils import timezone
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.prebuilt import create_react_agent

from .models import ChatMessage, ChatSession
from .tools import (
    consultar_servicios,
    consultar_convenios,
    consultar_convenios_servicio,
    consultar_servicios_convenio,
    consultar_disponibilidad_semanal,
    validar_datos_contacto,
    generar_ficha_confirmacion,
    finalizar_registro_cita
)
from .prompts import get_system_prompt

# Configuración del logger estándar de Django/Python
logger = logging.getLogger(__name__)

# ================= SERVICE CLASS =================

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(api_key=self.api_key, model="gpt-4o-mini", temperature=0)
        self.tools = [
            consultar_servicios,
            consultar_convenios,
            consultar_convenios_servicio,
            consultar_servicios_convenio,
            consultar_disponibilidad_semanal,
            validar_datos_contacto,
            generar_ficha_confirmacion,
            finalizar_registro_cita
        ]
        # Log de tools cargadas
        logger.info(f"AIService inicializado con {len(self.tools)} tools:")
        for tool in self.tools:
            logger.info(f"  - {tool.name}: {tool.description}")

    def get_response(self, session_id, user_message):
        try:
            if not self.api_key:
                logger.error("API Key not configured for AIService")
                return "Lo siento, el servicio de IA no está configurado actualmente (falta API Key)."

            session, _ = ChatSession.objects.get_or_create(session_id=session_id)
            
            ChatMessage.objects.create(session=session, role='user', content=user_message)
            # Preparar historial
            db_history = ChatMessage.objects.filter(session=session).order_by('timestamp', 'id')
            
            system_prompt = get_system_prompt(session_id)
            agent = create_react_agent(self.llm, tools=self.tools, prompt=system_prompt)
            
            chat_history = []
            for msg in db_history:
                # Omitir del historial mensajes que contienen términos prohibidos para evitar que la IA los imite
                # PERO: No podemos omitir mensajes que tienen tool_calls si queremos mantener la integridad de la cadena de mensajes de OpenAI
                if msg.content and "PRE-RESERVA" in msg.content and not msg.tool_calls:
                    continue

                if msg.role == 'user':
                    chat_history.append(HumanMessage(content=msg.content))
                else:
                    # Reconstruir mensajes del asistente (incluyendo tool_calls) o ToolMessages
                    if msg.tool_call_id:
                        chat_history.append(ToolMessage(content=msg.content or "", tool_call_id=msg.tool_call_id))
                    elif msg.tool_calls:
                        chat_history.append(AIMessage(content=msg.content or "", tool_calls=msg.tool_calls))
                    else:
                        chat_history.append(AIMessage(content=msg.content or ""))

            # invocamos al agente con su historial reconstruido
            result = agent.invoke({"messages": chat_history})
            
            # Buscamos qué mensajes son NUEVOS
            nuevos_mensajes = result["messages"][len(chat_history):]
            
            turn_responses = []
            has_tool_display = False
            
            for m in nuevos_mensajes:
                if isinstance(m, AIMessage):
                    save_content = m.content
                    t_calls = getattr(m, 'tool_calls', None)

                    # Log de tool calls
                    if t_calls:
                        logger.info(f"Tool calls detectados: {len(t_calls)}")
                        for tc in t_calls:
                            logger.info(f"  - Tool: {tc.get('name', 'unknown')}, Args: {tc.get('args', {})}")

                    ChatMessage.objects.create(
                        session=session,
                        role='assistant',
                        content=save_content,
                        tool_calls=t_calls
                    )

                    if save_content and save_content.strip():
                        turn_responses.append(save_content)
                elif isinstance(m, ToolMessage):
                    # Log del resultado de la tool
                    logger.info(f"ToolMessage recibido - ID: {m.tool_call_id}, Content length: {len(str(m.content))}")

                    # Solo guardamos en historial para que el LLM lo lea
                    ChatMessage.objects.create(
                        session=session,
                        role='assistant',
                        content=str(m.content),
                        tool_call_id=m.tool_call_id
                    )
                
            # Limpiar respuestas duplicadas por contenido exacto
            unique_responses = []
            for resp in turn_responses:
                if resp.strip() and resp not in unique_responses:
                    unique_responses.append(resp)

            return "\n\n".join(unique_responses) or "Solicitud procesada."
            
        except Exception as e:
            logger.exception("Error en AIService al procesar get_response")
            return f"Lo siento, hubo un error al procesar tu solicitud. (Ref: {type(e).__name__})"

