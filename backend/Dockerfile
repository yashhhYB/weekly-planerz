FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project files for layer-cached restore
COPY ["WeeklyPlanner.API/WeeklyPlanner.API.csproj", "WeeklyPlanner.API/"]
COPY ["WeeklyPlanner.Application/WeeklyPlanner.Application.csproj", "WeeklyPlanner.Application/"]
COPY ["WeeklyPlanner.Domain/WeeklyPlanner.Domain.csproj", "WeeklyPlanner.Domain/"]
COPY ["WeeklyPlanner.Infrastructure/WeeklyPlanner.Infrastructure.csproj", "WeeklyPlanner.Infrastructure/"]
COPY ["WeeklyPlanner.sln", "."]

RUN dotnet restore "WeeklyPlanner.API/WeeklyPlanner.API.csproj"

# Copy everything and build
COPY . .

RUN dotnet build "WeeklyPlanner.API/WeeklyPlanner.API.csproj" -c Release -o /app/build

FROM build AS publish

RUN dotnet publish "WeeklyPlanner.API/WeeklyPlanner.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=publish /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "WeeklyPlanner.API.dll"]
